import Itb from './itb';

class Idb{
    protected db_:unknown;
    protected tb_:unknown = {};
    db_name:string; //库名称
    version:number; //版本号
    constructor(db_name:string,version:number){
        this.db_name = db_name;
        this.version = version;
    }
    //创建表，table_name表名称；primary_key主键名称；index索引名称
    protected createTable_(table_name,primary_key,index){
        //检查旧版本中是否已有需要的对象存储（表）
        if (!this.db_.objectStoreNames.contains(table_name)) {
            //创建表（如果不设置keyPath(主键)，可autoIncrement=true(自动管理键)）
            const store = this.db_.createObjectStore(table_name, {
                keyPath: primary_key || null,
                autoIncrement: !primary_key
            });
            //如果不建其它索引，默认只能搜索主键（即从主键取值）
            //createIndex的参数1:索引名称；参数2:关联字段名称；参数3:unique，true不允许重复的值，false允许重复
            if(index){
                if(typeof index === 'string'){
                    store.createIndex(index, index, { unique: false });
                }else if(typeof index[0] === 'string'){ //如果index是一个数组，并且数组的值只是一个字符串，根据该数组值创建允许重复的索引
                    index.forEach(v=>{
                        if(typeof v === 'string') {
                            store.createIndex(v, v, { unique: false });
                        }else{
                            console.error(v,'not string');
                            return -1;
                        }
                    });
                }else if(typeof Object.keys(index)[0] === 'string'){ //如果index是一个对象，根据对象的key创建索引名，对象的值为unique的值
                    for(let k in index){
                        if(typeof k === 'string') {
                            store.createIndex(k, k, { unique: index[k] });
                        }else{
                            console.error(k,'not string');
                            return -1;
                        }
                    }
                }
            }
        }
    }
    /*
    table 表名称
        可以是数组(数组表示同时创建多个表)。如果是数组primary_key 与 index，由数组值定义 如: [
            [table1,primary_key1,index1],
            [table2,primary_key2,index2]
        ]
    primary_key 主键名称
    index 索引名称(支持: 字符串、数组、对象)
        ['name1','name2'] //数组的形式: 表示创建name1 与 name2索引，值允许重复
        {'name1':true,'name2':false} //对象的形式: 表示创建两个索引，name1的值不允许重复，name2的值允许重复
    */
    async open(table,primary_key,index){
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.db_name,this.version);
            //版本号变化或首次创建时触发
            request.onupgradeneeded = (event) => {
                this.db_ = event.target.result;
                if(Array.isArray(table[0])){
                    table.forEach(v=>{
                        this.createTable_(v[0],v[1],v[2]);
                    });
                }else if(typeof table === 'string'){
                    this.createTable_(table,primary_key,index);
                }
            }
            //成功回调
            request.onsuccess = (event) => {
                this.db_ = event.target.result;
                for(let i=0;i<this.db_.objectStoreNames.length;i++){
                    this.tb_[this.db_.objectStoreNames[i]] = new Itb(this.db_,this.db_.objectStoreNames[i]);
                }
                resolve(this);
            }
            //错误回调
            request.onerror = (event) => {
                reject(event.target.errorCode);
            }
        });
    }
    //删除库
    async delDB(){
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.db_name);
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            }
            request.onerror = (event)=>{
                reject(event.target.errorCode);
            };
        });
    }
    //删除表
    async delTable(tb_name){
        return new Promise((resolve, reject) => {
            //this.db_.close();
            const request = indexedDB.open(this.db_name,this.version+1);
            request.onupgradeneeded = (event)=>{
                event.target.result.deleteObjectStore(tb_name);
            }
            request.onsuccess = (event)=>{
                event.target.result.close();
                resolve(event.target.result);
            }
            request.onerror = (event)=>{
                reject(event.target.errorCode);
            };
        });
    };
    //选择要操作的存储对象，tb_name为空则表示选择第一个存储对象
    use(tb_name){
        if(tb_name){
            return this.tb_[tb_name];
        }else{
            let tb_k = Object.keys(this.tb_);
            if(tb_k.length){
                return this.tb_[tb_k[0]];
            }
        }
    }
};

export default Idb;