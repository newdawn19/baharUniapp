/**
 * 独立验证脚本：baharUniapp/config.js —— 四行业运行时切换
 *
 * config.js 是 CommonJS，但内部直接用了 uni.getStorageSync 和 window.location.search。
 * 注意 `// #ifdef H5` 只是普通 JS 注释，Node 下不会被剥离，那段代码照常执行，
 * 因此必须 mock global.uni / global.window。
 *
 * 行业是在模块加载时解析的，所以每个用例前都 delete require.cache 重新 require，
 * 模拟"新一次页面加载"。
 *
 * 用法： node verify-config.js
 */
'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'config.js');
const STORAGE_PATH = path.join(ROOT, 'utils', 'storage.js');

const EXPECTED_API = {
  shop: 'http://127.0.0.1:8081/',
  car: 'http://127.0.0.1:8082/',
  food: 'http://127.0.0.1:8083/',
  health: 'http://127.0.0.1:8084/'
};

const out = [];
function log(s) { out.push(s); console.log(s); }

let _store = {};
let _uniThrows = false;

function makeUni() {
  if (_uniThrows) {
    const boom = function () { throw new Error('uni API unavailable'); };
    return {
      getStorageSync: boom, setStorageSync: boom,
      removeStorageSync: boom, clearStorageSync: boom
    };
  }
  return {
    getStorageSync: function (k) {
      return Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : '';
    },
    setStorageSync: function (k, v) { _store[k] = v; },
    removeStorageSync: function (k) { delete _store[k]; },
    clearStorageSync: function () { _store = {}; }
  };
}

function setWindow(mode, search) {
  if (mode === 'undefined') { global.window = undefined; return; }
  if (mode === 'noLocation') { global.window = {}; return; }   // window 存在但没有 location
  global.window = { location: { search: search === undefined ? '' : search } };
}

/** 模拟"新一次页面加载" */
function loadConfig(opts) {
  opts = opts || {};
  delete require.cache[require.resolve(CONFIG_PATH)];
  delete require.cache[require.resolve(STORAGE_PATH)];
  _store = Object.assign({}, opts.storage || {});
  _uniThrows = !!opts.uniThrows;
  global.uni = makeUni();
  setWindow(opts.windowMode || 'normal', opts.search);
  let cfg = null, err = null;
  try { cfg = require(CONFIG_PATH); } catch (e) { err = e; }
  return { cfg: cfg, err: err, store: _store };
}

/** 走真实的 utils/storage.js 读残留登录态 */
function realStorageGet(k) { return require(STORAGE_PATH).get(k); }

// ---------------------------------------------------------------- 断言器
let total = 0, passed = 0, failed = 0;
const failures = [];

function eq(name, actual, expected) {
  total++;
  const ok = String(actual) === String(expected);
  if (ok) {
    passed++;
    log('  [PASS] ' + name + '  => ' + JSON.stringify(actual));
  } else {
    failed++;
    failures.push({ name: name, actual: actual, expected: expected });
    log('  [FAIL] ' + name + '  期望=' + JSON.stringify(expected) + '  实际=' + JSON.stringify(actual));
  }
}

function noThrow(name, err) {
  total++;
  if (!err) {
    passed++;
    log('  [PASS] ' + name + '  => 未抛异常');
  } else {
    failed++;
    failures.push({ name: name, actual: String(err), expected: 'no exception' });
    log('  [FAIL] ' + name + '  抛出了异常: ' + err.message);
  }
}

function section(t) { log(''); log('===== ' + t + ' ====='); }

// ---------------------------------------------------------------- 用例
function run() {
  let r;

  // ========== 1. 四行业解析 ==========
  section('1. 四行业解析：?m=<行业> -> apiUrl');
  ['shop', 'car', 'food', 'health'].forEach(function (key) {
    r = loadConfig({ search: '?m=' + key });
    noThrow('1.' + key + ' 加载不抛异常', r.err);
    eq('1.' + key + ' industry', r.cfg.industry, key);
    eq('1.' + key + ' apiUrl', r.cfg.apiUrl, EXPECTED_API[key]);
  });
  r = loadConfig({ search: '' });
  eq('1.default 无参数时 industry', r.cfg.industry, 'shop');
  eq('1.default 无参数时 apiUrl', r.cfg.apiUrl, EXPECTED_API.shop);
  eq('1.merchantNo', r.cfg.merchantNo, '10001');
  eq('1.industries 数量', Object.keys(r.cfg.industries).length, 4);

  // ========== 2. 优先级：storage > URL query > 默认 ==========
  section('2. 优先级：storage industry > ?m= > 默认 shop');
  r = loadConfig({ storage: { industry: 'car' }, search: '?m=shop' });
  eq('2.storage=car + ?m=shop -> storage 胜出', r.cfg.industry, 'car');

  r = loadConfig({ storage: { industry: 'shop' }, search: '?m=car' });
  eq('2.storage=shop + ?m=car -> storage 胜出', r.cfg.industry, 'shop');

  r = loadConfig({ storage: {}, search: '?m=food' });
  eq('2.无 storage + ?m=food -> query 生效', r.cfg.industry, 'food');
  eq('2.query 行业会落缓存(industry)', r.store.industry, 'food');

  r = loadConfig({ storage: { industry: 'xxx' }, search: '?m=health' });
  eq('2.storage 非法 + ?m=health -> query 生效', r.cfg.industry, 'health');

  r = loadConfig({ storage: { industry: 'shop' }, search: '' });
  eq('2.storage=shop 无 query', r.cfg.industry, 'shop');

  r = loadConfig({ storage: {}, search: '' });
  eq('2.全空 -> 默认 shop', r.cfg.industry, 'shop');

  // ========== 3. 非法输入静默回退，绝不抛异常 ==========
  section('3. 非法/异常输入：必须静默回退 shop 且不抛异常');

  r = loadConfig({ search: '?m=xxx' });
  noThrow('3.?m=xxx 不抛异常', r.err);
  eq('3.?m=xxx -> shop', r.cfg.industry, 'shop');
  eq('3.?m=xxx apiUrl', r.cfg.apiUrl, EXPECTED_API.shop);

  r = loadConfig({ search: '?m=' });
  noThrow('3.?m=(空) 不抛异常', r.err);
  eq('3.?m=(空) -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ search: '?m=%E4%B8%AD%E6%96%87' }); // 中文
  noThrow('3.?m=中文(URL编码) 不抛异常', r.err);
  eq('3.?m=中文 -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ search: '?m=%E4%B8%AD' }); // 畸形百分号编码，decodeURIComponent 会抛 URIError
  noThrow('3.?m=畸形百分号编码 不抛异常', r.err);
  eq('3.?m=畸形百分号编码 -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ search: '?xm=car' }); // 不是 m 参数
  noThrow('3.?xm=car 不抛异常', r.err);
  eq('3.?xm=car(非 m 参数) -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ storage: { industry: 'xxx' }, search: '' });
  noThrow('3.storage=xxx 不抛异常', r.err);
  eq('3.storage=xxx -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ storage: { industry: { a: 1 } }, search: '' });
  noThrow('3.storage=对象 不抛异常', r.err);
  eq('3.storage=对象 -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ storage: { industry: null }, search: '' });
  noThrow('3.storage=null 不抛异常', r.err);
  eq('3.storage=null -> shop', r.cfg.industry, 'shop');

  // storage 全挂：URL 上仍是合法行业时，按 URL 解析（不算"非法输入"），关键是绝不抛异常
  r = loadConfig({ uniThrows: true, search: '?m=food' });
  noThrow('3.uni API 全抛错 不抛异常', r.err);
  eq('3.uni API 全抛错 + 合法 ?m=food -> 仍按 URL 解析', r.cfg.industry, 'food');

  // storage 全挂 + 无合法 query -> 回退默认 shop
  r = loadConfig({ uniThrows: true, search: '' });
  noThrow('3.uni API 全抛错 + 无 query 不抛异常', r.err);
  eq('3.uni API 全抛错 + 无 query -> shop', r.cfg.industry, 'shop');
  eq('3.uni API 全抛错 + 无 query apiUrl', r.cfg.apiUrl, EXPECTED_API.shop);

  // storage 全挂 + 非法 query -> 回退默认 shop
  r = loadConfig({ uniThrows: true, search: '?m=xxx' });
  noThrow('3.uni API 全抛错 + 非法 query 不抛异常', r.err);
  eq('3.uni API 全抛错 + 非法 query -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ windowMode: 'undefined', search: '' });
  noThrow('3.window 为 undefined 不抛异常', r.err);
  eq('3.window 为 undefined -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ windowMode: 'noLocation', search: '' });
  noThrow('3.window.location 缺失 不抛异常', r.err);
  eq('3.window.location 缺失 -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ search: null });
  noThrow('3.location.search=null 不抛异常', r.err);
  eq('3.location.search=null -> shop', r.cfg.industry, 'shop');

  r = loadConfig({ search: undefined });
  noThrow('3.location.search=undefined 不抛异常', r.err);
  eq('3.location.search=undefined -> shop', r.cfg.industry, 'shop');

  // ========== 4. 大小写（规格待确认项） ==========
  section('4. 大小写 ?m=CAR —— 归一化 or 回退（规格待确认，单独列出）');
  r = loadConfig({ search: '?m=CAR' });
  noThrow('4.?m=CAR 不抛异常', r.err);
  log('  [INFO] ?m=CAR 实际解析 industry = ' + JSON.stringify(r.cfg.industry) +
    ' , apiUrl = ' + JSON.stringify(r.cfg.apiUrl));
  log('  [INFO] 若规格要求"非法输入一律回退 shop"，则此处应 = shop；' +
    '当前实现做了 toLowerCase 归一化，得到 car。仅记录，不自动判定。');

  r = loadConfig({ search: '?m=Food' });
  noThrow('4.?m=Food 不抛异常', r.err);
  log('  [INFO] ?m=Food 实际解析 industry = ' + JSON.stringify(r.cfg.industry));

  // ========== 5. 行业变化时清理登录态 ==========
  section('5. 行业变化时清理登录态（含 _expiry 后缀键）');

  const LOGIN_STORE = {
    AccessToken: 'tok-abc',
    AccessToken_expiry: String(Math.floor(Date.now() / 1000) + 86400),
    userId: '123',
    userId_expiry: String(Math.floor(Date.now() / 1000) + 86400),
    lastIndustry: 'shop'
  };
  const KEYS = ['AccessToken', 'AccessToken_expiry', 'userId', 'userId_expiry'];

  // 5a 行业 shop -> car，必须清干净
  r = loadConfig({ storage: Object.assign({}, LOGIN_STORE), search: '?m=car' });
  noThrow('5a 加载不抛异常', r.err);
  eq('5a industry', r.cfg.industry, 'car');
  KEYS.forEach(function (k) {
    eq('5a 残留检查 ' + k + ' 应被清除', Object.prototype.hasOwnProperty.call(r.store, k), false);
  });
  let uid = realStorageGet('userId');
  let tok = realStorageGet('AccessToken');
  eq('5a storage.get(userId) 应为 falsy', !!uid, false);
  eq('5a storage.get(AccessToken) 应为 falsy', !!tok, false);
  eq('5a checkLogin() 等价判定 !!userId 应为 false', !!uid, false);
  eq('5a lastIndustry 已更新', r.store.lastIndustry, 'car');

  // 5b 行业未变化，登录态必须保留
  r = loadConfig({ storage: Object.assign({}, LOGIN_STORE), search: '' });
  noThrow('5b 加载不抛异常', r.err);
  eq('5b industry', r.cfg.industry, 'shop');
  eq('5b AccessToken 保留', r.store.AccessToken, 'tok-abc');
  eq('5b userId 保留', r.store.userId, '123');
  uid = realStorageGet('userId');
  eq('5b storage.get(userId)', uid, '123');
  eq('5b checkLogin() 等价判定 !!userId 应为 true', !!uid, true);

  // 5c setIndustry 切到 food，清理 + 落缓存
  r = loadConfig({ storage: Object.assign({}, LOGIN_STORE), search: '' });
  noThrow('5c 加载不抛异常', r.err);
  const okSet = r.cfg.setIndustry('food');
  eq('5c setIndustry("food") 返回 true', okSet, true);
  KEYS.forEach(function (k) {
    eq('5c 残留检查 ' + k + ' 应被清除', Object.prototype.hasOwnProperty.call(r.store, k), false);
  });
  eq('5c industry 缓存已写入', r.store.industry, 'food');
  eq('5c lastIndustry 缓存已写入', r.store.lastIndustry, 'food');
  uid = realStorageGet('userId');
  eq('5c checkLogin() 等价判定 !!userId 应为 false', !!uid, false);

  // 5d setIndustry 非法值：返回 false 且不动缓存
  r = loadConfig({ storage: Object.assign({}, LOGIN_STORE), search: '' });
  noThrow('5d 加载不抛异常', r.err);
  const badSet = r.cfg.setIndustry('bogus');
  eq('5d setIndustry("bogus") 返回 false', badSet, false);
  eq('5d AccessToken 未被误删', r.store.AccessToken, 'tok-abc');
  eq('5d userId 未被误删', r.store.userId, '123');
  eq('5d industry 未被写入(键不存在)', Object.prototype.hasOwnProperty.call(r.store, 'industry'), false);

  // 5e setIndustry 切到与当前相同的行业：不应清登录态
  r = loadConfig({ storage: Object.assign({}, LOGIN_STORE), search: '' });
  noThrow('5e 加载不抛异常', r.err);
  const sameSet = r.cfg.setIndustry('shop');
  eq('5e setIndustry("shop") 返回 true', sameSet, true);
  eq('5e 同行业切换不应清 AccessToken', r.store.AccessToken, 'tok-abc');
  eq('5e 同行业切换不应清 userId', r.store.userId, '123');

  // ========== 汇总 ==========
  section('汇总');
  log('总断言数 = ' + total + ' ，PASS = ' + passed + ' ，FAIL = ' + failed);
  if (failures.length) {
    log('');
    log('---- FAIL 明细 ----');
    failures.forEach(function (f) {
      log('  * ' + f.name);
      log('      期望: ' + JSON.stringify(f.expected));
      log('      实际: ' + JSON.stringify(f.actual));
    });
  }
  try { fs.writeFileSync(path.join(ROOT, 'verify-config.log'), out.join('\n'), 'utf8'); } catch (e) {}
  process.exitCode = failed ? 1 : 0;
}

run();
