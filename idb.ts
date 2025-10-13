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
    //打开或创建库。table为表名称，primary_key为主键名，index为索引名(索引值可以是，字符串、对象、数组、数组对象。假设index是 {'name':true} 表示创建一个名称为name的索引，true表示值不允许重复，false表示允许重复)
    //创建多个表的示例：table=[['tb1','id','name'],['tb2','id','name']]（数组的第一个值为表名称，第二个为主键名，第三个为索引名）；primary_key=null；index=null
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
                let i=0;
                for(i;i<this.db_.objectStoreNames.length;i++){
                    this.tb_[this.db_.objectStoreNames[i]] = new Itb(this.db_,this.db_.objectStoreNames[i]);
                }
                if(i==1){
                    resolve(this.tb_[this.db_.objectStoreNames[0]]);
                }else{
                    resolve(this.tb_);
                }
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
                //如果index只是一个字符串，根据该字符串创建允许重复的索引
                if(typeof index === 'string'){
                    store.createIndex(index, index, { unique: false });
                }else{
                    //如果index是一个数组，并且数组的值只是一个字符串，根据该数组值创建允许重复的索引
                    if(typeof index[0] === 'string'){
                        index.forEach(v=>{
                            if(typeof v === 'string') {
                                store.createIndex(v, v, { unique: false });
                            }else{
                                console.error(v,'not string');
                                return -1;
                            }
                        });
                    }else{
                        //如果index是一个数组，并且数组的值是一个对象，根据对象的key创建索引名，对象的值为unique的值
                        if(Array.isArray(index)){
                            index.forEach(v=>{
                                if(typeof Object.keys(v)[0] === 'string') {
                                    store.createIndex(Object.keys(v)[0], Object.keys(v)[0], { unique: Object.values(v)[0] });
                                }else{
                                    console.error(typeof Object.keys(v)[0],'not string');
                                    return -1;
                                }
                            });
                        }else{
                            //如果index是一个对象，根据对象的key创建索引名，对象的值为unique的值
                            if(typeof Object.keys(index)[0] === 'string') {
                                store.createIndex(Object.keys(index)[0], Object.keys(index)[0], { unique: Object.values(index)[0] });
                            }else{
                                console.error(Object.keys(index)[0],'not string');
                                return -1;
                            }
                        }
                    }
                }
            }
        }
    }
    //选择要操作的存储对象
    /* use(tb_name){
        return this.tb_[tb_name];
    } */
};

export default Idb;