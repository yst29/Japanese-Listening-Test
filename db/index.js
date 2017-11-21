const { Pool, Client } = require('pg');
const util = require('util');

let client_setting;
if(global.env == 'production'){
	client_setting = {
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	}
} else{
	client_setting = {
		user: 'postgres',
		host: 'localhost',
		database: 'postgres',
		password: 'admin',
		port: 5432,
	};
}

module.exports = {

	query_single_data : function(table,name,condition,isAllField){
		const client = new Client(client_setting);
		return new Promise(function(resolve, reject){
			let query_text;
			if(isAllField){
				query_text = util.format("SELECT * FROM %s WHERE %s = $1",table,name);
			} else{
				query_text = util.format("SELECT %s FROM %s WHERE %s = $1",name,table,name);
			}
			const query_obj = {
				text: query_text,
				values: [condition]
			}
			client.connect();
			client.query(query_obj, function(err, res){
				if(err){
					reject(err);
				} else{
					resolve(res.rows);
				}
				client.end();
			});
		});
	},

	insert_account : function(uname,hash){
		const client = new Client(client_setting);
		return new Promise(function(resolve, reject){
			const query_obj = {
				text: "INSERT INTO account(username, password) VALUES ($1,$2)",
				values: [uname,hash]
			}
			client.connect();
			client.query(query_obj, function(err, res){
				if(err){
					reject(err);
				} else{
					resolve();
				}
				client.end();
			});
		});
	},

	insert_wrong_anwsers : function(aid,qids){
		console.log(aid,qids);
		const client = new Client(client_setting);
		return new Promise(function(resolve, reject){
			const query_obj = {
				text: "INSERT INTO wrong_answer(aid, qid) SELECT $1,x FROM unnest($2::int[]) x;",
				values: [aid,qids]
			}
			console.log(query_obj);
			client.connect();
			client.query(query_obj, function(err, res){
				if(err){
					reject(err);
				} else{
					resolve();
				}
				client.end();
			});
		});
	},

	query_wrong_anwsers : function(aid){
		const client = new Client(client_setting);
		return new Promise(function(resolve, reject){
			const query_obj = {
				text: "SELECT q.qid, q.word, q.difficulty, w.wid, TO_CHAR(w.timestamp,'YYYY/MM/DD HH24:MI:SS') as timestamp \
					   FROM question q, wrong_answer w \
					   WHERE q.qid = w.qid AND w.aid = $1 \
					   ORDER BY w.timestamp;",
				values: [aid]
			}
			client.connect();
			client.query(query_obj, function(err, res){
				if(err){
					reject(err);
				} else{
					resolve(res.rows);
				}
				client.end();
			});
		});
	},

	delete_wrong_anwsers : function(wids){
		const client = new Client(client_setting);
		return new Promise(function(resolve, reject){
			if(wids.length==0){
				reject(new Error('wids is empty'));
			} else{
				const query_obj = {
					text: "DELETE FROM wrong_answer WHERE wid = ANY ($1)",
					values: [wids]
				}
				client.connect();
				client.query(query_obj, function(err, res){
					if(err){
						reject(err);
					} else{
						resolve();
					}
					client.end();
				});
			}
		});
	},

	query_questions : function(difficulty_arr){
		const client = new Client(client_setting);
		return new Promise(function(resolve, reject){
			if(difficulty_arr.length==0){
				reject(new Error('difficulty_arr is empty'));
			}else{
				const query_obj = {
					text: "SELECT qid,word FROM question WHERE difficulty = ANY ($1)",
					values: [difficulty_arr]
				}
				client.connect();
				client.query(query_obj, function(err, res){
					if(err){
						reject(err);
					} else{
						resolve(res.rows);
					}
					client.end();
				});
			}
		});
	}
} //end of module.exports