# -*- coding: utf-8 -*-
#!/usr/bin/env python
# @Date    : 2015-11-18 21:20:05
# @Author  : jerry.liangj@qq.com
import hashlib
import json
from sqlalchemy.orm.exc import NoResultFound
from ..Basehandler import BaseHandler
import traceback
from ..databases.tables import Users,Access_Token

class LoginHandler(BaseHandler):
    def get(self):
        ret = {'code':200,'content':'ok'}
        self.write(json.dumps(ret,ensure_ascii=False, indent=2))

    def post(self):
        retjson = {'code':200,'content':'ok'}
        phone = self.get_argument('user_phone',None)
        pwd = self.get_argument('password',None)
        if not phone or not pwd:
            retjson['code'] = 400
            retjson['content'] = u'用户名密码不能为空'
        else:
            try:
                user = self.db.query(Users).filter(Users.phone == phone).one()
                password = hashlib.md5(user.salt.join(pwd)).hexdigest()
                if password == user.password:
                    access_token = self.db.query(Access_Token).filter(Access_Token.phone == phone).one()
                    retjson['content'] = access_token.token
                else:
                    retjson['code'] = 400
                    retjson['content'] = u'密码错误'
            except NoResultFound:
                retjson['code'] = 301
                retjson['content'] = u'用户不存在'
            except:
                # print traceback.print_exc()
                retjson['code'] = 500
                retjson['content'] = u'系统错误'

        self.write_back(retjson)
class InfoGetHandler(BaseHandler):
    def get(self):
        ret = {'code':200,'content':'ok'}
        self.write(json.dumps(ret,ensure_ascii=False, indent=2))

    def post(self):
        retjson = {'code':200,'content':'ok'}
        token = self.get_current_user()
        if not token:
            retjson['code'] = 400
            retjson['content'] = u'请先登录'
        else:
            try:
                user = self.db.query(Users).filter(Users.phone == token.phone).one()
                retjson['content'] = {
                    'phone': user.phone,
                    'name': user.name,
                    'cardnum': user.cardnum
                }
            except NoResultFound:
                retjson['code'] = 301
                retjson['content'] = u'用户不存在'
            except:
                # print traceback.print_exc()
                retjson['code'] = 500
                retjson['content'] = u'系统错误'
        self.write_back(retjson)
