// 防止热更新刷新整个页面
if (module && module.hot) {
  module.hot.accept();
}

// resolve.modules 定义了库会去components中寻找
import { mockData } from "util";
// 通过别名引入
import { login } from "@/components/util";
import "./assets/less/index";
import "./assets/less/public";

const res = mockData();
console.log(res);

const res2 = login();
console.log(res2);

console.log("通过lodash插入的全局变量", _);
