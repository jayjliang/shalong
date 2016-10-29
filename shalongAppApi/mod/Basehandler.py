# -*- coding: utf-8 -*-
#!/usr/bin/env python
import time
import tornado.web
import tornado.gen
from databases.tables import Access_Token,Admin_token
import json

class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db
    def on_finish(self):
        self.db.close()

    def options(self):
        retjson = {'code':200}
        self.write_back(retjson)
    def get_current_user(self):
        # token = self.get_argument("token",None)
        token = self.request.headers['Token'] if 'Token' in self.request.headers.keys() else None
        if token:
            try:
                token = self.db.query(Access_Token).filter(Access_Token.token==token).one()
                return token
            except:
                return False
        else:
            return False
    def get_current_admin(self):
        token = self.request.headers['Admin'] if 'Admin' in self.request.headers.keys() else None
        if token:
            try:
                token = self.db.query(Admin_token).filter(Admin_token.token==token).one()
                return token
            except:
                return False
        else:
            return False
    def change_time(self,init,mod):
        if mod==0:
             return int(time.mktime(time.strptime(init,"%Y-%m-%d")))
        elif mod==1:
            return time.strftime("%Y-%m-%d",time.localtime(int(init)))

    def write_back(self,content):
        self.set_header('Access-Control-Allow-Origin','*')
        self.set_header('Access-Control-Allow-Methods','GET,POST')
        self.set_header('Access-Control-Allow-Headers','token,admin')
        self.write(json.dumps(content,ensure_ascii=False, indent=2))
        self.finish()