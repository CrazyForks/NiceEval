// 包外用户报告的等价副本:一个普通用户会写的 --report 文件,只从 niceeval/report 的公开
// barrel(这里按测试约定用相对源码路径 src/report/index.ts)import 积木,零内部路径、零数据装配。
//
// 它使用公开的组合件与公开 `.data()`，与内置 definition 的 build 面逐节点同构。
// built-in-user-parity.test.tsx 以此证明「内置报告就是普通用户报告」：同一 Selection 下
// 两者都只把预计算好的分组数据交给同一个双面组件，没有 renderer 私有通道。

import { ExperimentComparison, defineReport } from "../../../src/report/index.ts";

export default defineReport(async ({ selection }) => {
  const data = await ExperimentComparison.data(selection);
  return <ExperimentComparison data={data} />;
});
