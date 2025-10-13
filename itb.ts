class Itb{
    protected db_:unknown; //存储库
    protected store_:unknown; //存储对象
    protected model_:number; //当前模式
    protected tb_name:string; //存储对象的名称
    constructor(db:unknown,tb_name:string){
        this.db_ = db;
        this.tb_name = tb_name;
        this.model_ = 0;
    }
    //只读
    protected read_(){
        this.model_ = 1;
        //新建一个事务（参数1:是将要处理的表，可以是数组。参数2:处理模式（默认readonly只读 或 readwrite读写））
        this.store_ = this.db_.transaction([this.tb_name],'readonly').objectStore([this.tb_name]);
    };
    //可写
    protected write_(){
        this.model_ = 2;
        this.store_ = this.db_.transaction([this.tb_name], 'readwrite').objectStore([this.tb_name]);
    };
    //清空表
    async clear(){
        return new Promise((resolve, reject) => {
            if(this.model_ != 2){this.write_();}
            let request = this.store_.clear();
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            };
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
    //删除数据
    async del(primary_key){
        return new Promise((resolve, reject) => {
            if(this.model_ != 2){this.write_();}
            let request = this.store_.delete(primary_key);
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            };
            request.onerror = (event)=>{
                reject(event.target.error);
            };
        });
    }
    //新增数据
    async add(data){
        return new Promise((resolve, reject) => {
            if(this.model_ != 2){this.write_();}
            let request = this.store_.add(data);
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            }
            request.onerror = (event)=>{
                reject(event.target.error);
            }
        });
    }
    //更新数据
    async put(data,primary_key){
        return new Promise((resolve, reject) => {
            if(this.model_ != 2){this.write_();}
            let request = this.store_.put(data,primary_key);
            request.onsuccess = (event)=>{
                resolve(event.target.result);
            }
            request.onerror = (event)=>{
                reject(event.target.error);
            }
        });
    }
    //只有 k 表示通过主键获取数据
    //如果有 v 表示通过索引获取数据，k=索引名，v=索引值（前提是创建了索引）
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
    //通过索引查找数据。index:索引名；只有 v1 表示模糊查找；如果有 v2 就是范围查询
    async getF(index,v1,v2){
        return new Promise((resolve, reject) => {
            if(this.model_ != 1){this.read_();}
            let data = [];
            let request = {};
            let cursor = {};
            if(index){
                const ii = this.store_.index(index);
                if(v2){ //游标范围查询（适用于前缀匹配），从v1到v2之间的数据
                    request = ii.openCursor(IDBKeyRange.bound(v1, v2)); //openCursor参数1:查询范围；参数2:遍历方向(默认为下一个，prev为上一个)(两个参数都空为默认，表示所有数据升序遍历)
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
                    request = ii.openCursor();
                    request.onsuccess = (event)=>{
                        cursor = event.target.result;
                        if(cursor){
                            if(regex.test(cursor.value[index])){
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
}

export default Itb;