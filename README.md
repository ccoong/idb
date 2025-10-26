# idb
### 库操作:
```javascript
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
        export const a1 = new Idb('database1',1).open('table1',null,'name'); //打开或创建 database1存储库 与 table1存储对象；主键null表示自动管理；并创建name为普通索引
```
### 表操作:
```javascript

    选择将要操作的存储对象(如果仅一个存储对象，table_name可以为空):
        use(table_name)
    新增:
        add({'name':'小明1'})
    修改:
        put({'id':1,'name':'小强1'}) //如果创建了id为主键索引，如open('table1','id','name')
        put({'name':'小强1'}, 1) //第二个参数为:要修改的自动主键值，前提是没有手动创建主键索引，如open('table1',null,'name')
        put({'name':'小强1'}) //同上，且第二个参数为空，表示新增一条数据
    清空:
        clear()
    删除:
        del(1) //参数为主键值
    获取:
        get(1) //参数为主键值
        get('name','小明1') //通过索引名 name 获取 name==小明1，的那条数据
    模糊查找:
        getF('name','小明') //根据索引名name，搜索值包含小明的数据
        getF('name','小明1','小明2') //根据索引名name，获取从小明1 到 小明2之间的数据
    获取全部键:
        getAllK()
    获取全部数据:
        getAll()
    示例:
        如果仅创建了单个存储对象，如: export const a1 = new Idb('database1',1).open('table1',null,'name');
            调用:
                a1.then(r=>{
                    r.use().add({'name':'小明1'}).then(rr=>{
                        console.log(rr);
                    });
                });
            或:
                a1.then(r=>{
                    //表示选择存储对象 table1 对它进行 add 操作
                    r.use('table1').add({'name':'小明1'}).then(rr=>{
                        console.log(rr);
                    });
                });
        如果同一存储库，创建了多个存储对象，如: export const a1 = new Idb('database1',1).open([
            ['table1',null,'name'],
            ['table2',null,'name']
        ]);
            调用:
                a1.then(r=>{
                    //表示选择存储对象 table1 对它进行 add 操作
                    r.use('table1').add({'name':'小明1'}).then(rr=>{
                        console.log(rr);
                    });
                    //表示选择存储对象 table2 对它进行 add 操作
                    r.use('table2').add({'name':'小明1'}).then(rr=>{
                        console.log(rr);
                    });
                });
```
### 完整示例:
```javascript
<script setup>
    import {a1} from "@/compss/ts/idb"; //export const a1 = new Idb('database1',1).open('table1',null,'name');
    import { onMounted } from "vue";

    onMounted(() => {
        a1.then(r=>{
            r.use().add({'name':'小明1'}).then(rr=>{
                console.log(rr);
            });
        })
    });
</script>
```