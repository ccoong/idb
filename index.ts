class Idb{
    protected db_:unknown;
    protected model_:number;
    protected store_:unknown; //对象存储(表)
    db_name:string; //库名称
    table_name:string; //存储对象的名称
    version:number; //版本号
    constructor(db_name:string, table_name:string,version:number){
        this.model_ = 0;
        this.db_name = db_name;
        this.table_name = table_name;
        this.version = version;
    }
    //key为主键名称；index为索引名称（index值可以是，字符串、对象、数组、数组对象。假设index是对象如: {'name':true} 表示创建一个名称为name的索引，true表示值不允许重复，false表示允许重复）
    async open(key,index){
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.db_name, this.version);
            //版本号变化或首次创建时触发
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                //检查旧版本中是否有需要的对象存储（表）
                if (!db.objectStoreNames.contains(this.table_name)) {
                    //创建表（如果不设置keyPath(主键)，可autoIncrement=true(自动管理键)）
                    const store = db.createObjectStore(this.table_name, {
                        keyPath: key || null,
                        autoIncrement: !key
                    });
                    //如果不建其它索引，默认只能搜索主键（即从主键取值）
                    //createIndex参数1:索引的名称；参数2:关联的字段名称；参数3:unique 为 true 不允许重复的值
                    if(index){
                        //如果index只是一个字符串，根据该字符串创建允许重复的索引
                        if(typeof index === 'string'){
                            store.createIndex(index, index, { unique: false });
                        }else{
                            //如果index是一个数组，并且数组的值只是一个字符串，根据该字符串创建允许重复的索引
                            if(typeof index[0] === 'string'){
                                index.forEach(v=>{
                                    if(typeof v === 'string') {
                                        store.createIndex(v, v, { unique: false });
                                    }else{
                                        console.error(v,'not string');
                                    }
                                });
                            }else{
                                //如果index是一个数组，并且数组的值是一个对象，根据对象的key创建索引名，对象的值为unique的值，false表示允许重复，true表示不允许重复
                                if(Array.isArray(index)){
                                    index.forEach(v=>{
                                        if(typeof Object.keys(v)[0] === 'string') {
                                            store.createIndex(Object.keys(v)[0], Object.keys(v)[0], { unique: Object.values(v)[0] });
                                        }else{
                                            console.error(typeof Object.keys(v)[0],'not string');
                                        }
                                    });
                                }else{
                                    //如果index是一个对象，根据对象的key创建索引名，对象的值为unique的值
                                    if(typeof Object.keys(index)[0] === 'string') {
                                        store.createIndex(Object.keys(index)[0], Object.keys(index)[0], { unique: Object.values(index)[0] });
                                    }else{
                                        console.error(Object.keys(index)[0],'not string');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //成功回调
            request.onsuccess = (event) => {
                this.db_ = event.target.result;
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
    async delTable(){
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.db_name, this.version);
            request.onupgradeneeded = (event)=>{
                event.target.result.deleteObjectStore(this.table_name);
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
    //只读
    protected read_(){
        this.model_ = 1;
        this.store_ = this.db_.transaction([this.table_name],'readonly').objectStore([this.table_name]);
    };
    //可写
    protected write_(){
        this.model_ = 2;
        //新建一个事务插入数据（参数1:是将要处理的表可以是数组。参数2:处理模式（默认readonly只读 或 readwrite读写））
        this.store_ = this.db_.transaction([this.table_name], 'readwrite').objectStore([this.table_name]);
    };
    //删除数据，删除主键==key的那条数据，不提供主键表示清空表
    async del(key){
        return new Promise((resolve, reject) => {
            if(this.model_ != 2){this.write_();}
            let request = {};
            if(key){
                request = this.store_.delete(key);
            }else{
                request = this.store_.clear();
            }
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            };
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
    //新增或更新数据，只有data表示新增数据，如果有 key 就表示通过主键更新数据
    async put(data,key){
        return new Promise((resolve, reject) => {
            if(this.model_ != 2){this.write_();}
            let request = '';
            if(key){
                request = this.store_.put(data,key);
            }else{
                request = this.store_.add(data);
            }
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            }
            request.onerror = (event)=>{
                reject(event.target.error);
            }
        });
    }
    //只有 k 通过主键获取数据；如果有 v 通过索引获取数据（前提是创建了索引）
    async get(k,v){
        return new Promise((resolve, reject) => {
            if(this.model_ != 1){this.read_();}
            let request = '';
            if(v){
                const index = this.store_.index(k);
                request = index.get(v);
                
            }else{
                request = this.store_.get(k);
            }
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            };
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
    //通过索引查找数据。k:索引名（前提是创建了索引）；只有 v1 表示模糊查找；如果有 v2 就是范围查询
    async getF(k,v1,v2){
        return new Promise((resolve, reject) => {
            if(this.model_ != 1){this.read_();}
            let data = [];
            let request = {};
            let cursor = {};
            if(k){
                const index = this.store_.index(k);
                if(v2){ //游标范围查询（适用于前缀匹配），从v1到v2之间的数据
                    request = index.openCursor(IDBKeyRange.bound(v1, v2)); //openCursor参数1:查询范围；参数2:遍历方向(默认为下一个，prev为上一个)(两个参数都空为默认，表示所有数据升序遍历)
                    request.onsuccess = (event)=>{
                        cursor = event.target.result;
                        if (cursor) {
                            data.push(cursor.value);
                            cursor.continue();
                        }
                        resolve(data);
                    };
                }else{ //模糊查找
                    const regex = new RegExp(v1, 'i'); //'i'表示不区分大小写
                    request = index.openCursor();
                    request.onsuccess = (event)=>{
                        cursor = event.target.result;
                        if(cursor){
                            if(regex.test(cursor.value[k])){
                                data.push(cursor.value);
                            }
                            cursor.continue();
                        }
                        resolve(data);
                    };
                }
            }else{ //游标方式获取所有数据
                request = this.store_.openCursor();
                request.onsuccess = (event)=>{
                    cursor = event.target.result;
                    if(cursor){
                        data.push(cursor.value);
                        cursor.continue();
                    }
                    resolve(data);
                };
            }
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
    //获取全部数据
    async getAll(){
        return new Promise((resolve, reject) => {
            if(this.model_ != 1){this.read_();}
            const request = this.store_.getAll();
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            };
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
    //获取全部主键
    async getAllK(){
        return new Promise((resolve, reject) => {
            if(this.model_ != 1){this.read_();}
            const request = this.store_.openKeyCursor();
            let data = [];
            request.onsuccess = (event)=>{
                const cursor = event.target.result;
                if (cursor) {
                    data.push(cursor.primaryKey);
                    cursor.continue();
                }
                resolve(data);
            };
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
};

export const a1 = new Idb('db1','tb1',1).open(null,[{'name':true},{'age':false}]);