import Idb from './idb';

export const a1 = new Idb('db1',1).open('tb1','id','name'); //打开或创建 db1 存储库 与 tb1存储对象（表）；主键为id；索引为name
//export const a1 = new Idb('db1',1).open([['tb1','id','name'],['tb2','id','name']]); //同上，创建 tb1 和 tb2 表
//export const a1 = new Idb('db1',1).delDB(); //删除库
//export const a1 = new Idb('db1',1).delTable('tb1'); //删除表