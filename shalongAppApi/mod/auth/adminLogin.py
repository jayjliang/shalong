# -*- coding: utf-8 -*-
#!/usr/bin/env python
# @Date    : 2016-02-27 14:20:05
# @Author  : jerry.liangj@qq.com
import json,uuid,time
from sqlalchemy.orm.exc import NoResultFound
from ..Basehandler import BaseHandler
from ..databases.tables import Admin,Admin_token

class AdminLoginHandler(BaseHandler):
    def get(self):
        ret = {'code':200,'content':'ok'}
        self.write(json.dumps(ret,ensure_ascii=False, indent=2))

    def post(self):
        retjson = {'code':200,'content':'ok'}
        admin = self.get_argument('admin',None)
        pwd = self.get_argument('password',None)
        if not admin or not pwd:
            retjson['code'] = 400
            retjson['content'] = u'用户名密码不能为空'
        else:
            try:
                user = self.db.query(Admin).filter(Admin.phone == admin).one()
                if pwd == user.password:
                    token = uuid.uuid1()
                    try:
                        access_token = self.db.query(Admin_token).filter(Admin_token.phone == admin).one()
                        access_token.token = token
                    except NoResultFound:
                        token = uuid.uuid1()
                        ip = self.request.remote_ip
                        access_token = Admin_token(phone = admin,token = token,last_time = int(time.time()),ip=ip)
                    self.db.add(access_token)
                    self.db.commit()
                    retjson['content'] = str(token)
                else:
                    retjson['code'] = 400
                    retjson['content'] = u'密码错误'
            except NoResultFound:
                retjson['code'] = 301
                retjson['content'] = u'用户名密码错误'
            except:
                self.db.rollback()
                retjson['code'] = 500
                retjson['content'] = u'系统错误'

        self.write_back(retjson)
