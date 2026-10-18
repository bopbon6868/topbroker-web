// Chạy: node tools/test_core.js  (thoát mã 1 nếu có ca trượt)
const C = require('../site/bac-si-danh-muc/tb-core.js');
const T = require('../site/bac-si-danh-muc/tb-core.tests.js');
const res = T.run(C);
let fail = 0;
for (const r of res) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? 'ĐẠT ' : 'TRƯỢT'} ${r.code.padEnd(7)} ${r.name}${r.pass ? '' : `\n        mong đợi: ${r.expect}\n        nhận được: ${r.got}`}`);
}
console.log(`\n${C.VERSION}: ${res.length - fail}/${res.length} ca đạt`);
process.exit(fail ? 1 : 0);
