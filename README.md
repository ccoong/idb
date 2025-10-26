# idb

库操作:
    open(table,primary_key,index)
        table 表名称
            可以是数组(数组表示同时创建多个表)。如果是数组primary_key 与 index，由数组值定义 如: [
                [table1,primary_key1,index1],
                [table2,primary_key2,index2]
            ]
        primary_key 主键名称
        index 索引名称(支持: 字符串、数组、对象)
            ['name1','name2'] //数组的形式: 表示创建name1 与 name2索引，值允许重复
            {'name1':true,'name2':false} //对象的形式: 表示创建两个索引，name1的值不允许重复，name2的值允许重复
        示例:
            open('table','id',['name1','name2']); //打开或创建 table1 存储对象；并创建主键为id；且创建值允许重复的索引name1 和 name2
            open('table','id',{'name1':true},{'name2':false}); //同上；name1的值禁止重复，name2的值不禁止重复
            open([
                ['table1','id',{'name1':true},{'name2':false}],
                ['table2','id',{'name1':true},{'name2':false}]
            ]); //同上，创建两个存储对象，分别为 table1 和 table2
    delDB();
        删除库
    delTable(table);
        删除表，传入要删除的表名
    示例:
        export const a1 = new Idb('database1',1).open('table1',null,'name'); //打开或创建 database1存储库 与 table1存储对象，主键null表示自动管理，并创建普通索引name
表操作:
    import {a1} from "@/compss/ts/idb"
        导入idb/index.ts构建的a1对象 如: export const a1 = new Idb('database1',1).open('table1',null,'name');
    如果同一存储库，有多个存储对象，如: export const a1 = new Idb('database1',1).open([
            ['table1',null,'name'],
            ['table2',null,'name']
        ]);
        调用的时候需带上具体需要操作的表名:
            a1.then(r=>{
                r['table1'] //表示将要操作 table1 存储对象
                r['table2'] //表示将要操作 table2 存储对象
            });
        示例:
            如果仅创建了单个存储对象，如: export const a1 = new Idb('database1',1).open('table1',null,'name');
                调用:
                    a1.then(r=>{ 
                        r.add({'name':'小明1'}).then(rr=>{
                            console.log(rr);
                        });
                    });
            如果同一存储库，创建了多个存储对象，如: export const a1 = new Idb('database1',1).open([
                ['table1',null,'name'],
                ['table2',null,'name']
            ]);
                调用:
                    a1.then(r=>{
                        r['table1'].add({'name':'小明1'}).then(rr=>{
                            console.log(rr);
                        });
                        r['table2'].add({'name':'小明1'}).then(rr=>{
                            console.log(rr);
                        });
                    });
    全部功能:
        新增数据:
            r.add({'name':'小明1'}).then(rr=>{ console.log(rr); });
        新增或修改:
            r.put({'id':1,'name':'小明2','age':2}).then(rr=>{
                console.log(rr);
            });
        清空:
            r.clear().then(rr=>{
                console.log(rr);
            });
        删除:
            r.del(1).then(rr=>{
                console.log(rr);
            });
        获取:
            r.get(1).then(rr=>{
                console.log(rr);
            });
            r.get('name','小明1').then(rr=>{
                console.log(rr);
            });
        模糊查找:
            r.getF('name','小明').then(rr=>{
                console.log(rr);
            });
            r.getF('name','小明1','小明2').then(rr=>{
                console.log(rr);
            });
        获取全部键:
            r.getAllK().then(rr=>{
                console.log(rr);
            });
        获取全部数据:
            r.getAll().then(rr=>{
                console.log(rr);
            });
    完整示例:
        <script setup>
            import {a1} from "@/compss/ts/idb";
            import { onMounted } from "vue";

            onMounted(() => {
                a1.then(r=>{
                    r.add({'id':1,'name':'小明1','age':1}).then(rr=>{
                        console.log(rr);
                    });
                })
            });
        </script>