# -*- coding: utf-8 -*-
#!/usr/bin/env python
# @Date    : 2015-11-18 21:20:05
# @Author  : jerry.liangj@qq.com
import hashlib
import random
import string

import uuid
import time
from ..databases.tables import Users,Access_Token
from ..Basehandler import BaseHandler
from sqlalchemy.exc import IntegrityError
import traceback

class RegisterHandler(BaseHandler):

    def post(self):
        ret = {'code':200,'content':u'注册成功'}
        phone = self.get_argument('phone',None)
        pwd = self.get_argument('password',None)
        cardnum = self.get_argument('cardnum',None)
        if not (pwd and phone and cardnum):
            ret['code'] = 400
            ret['content'] = u'参数不能为空'
        elif len(phone)!=11 or (not phone.isdigit()):
            ret['code'] = 402
            ret['content'] = u'手机号格式不正确'
        elif len(pwd) < 6:
                ret['code'] = 401
                ret['content'] = u'密码太短'
        else:
            try:
                state = 1
                salt = ''.join(random.sample(string.ascii_letters + string.digits, 32))
                pwd =  hashlib.md5(salt.join(pwd)).hexdigest()
                user = Users(phone = phone, password = pwd, name = phone, salt = salt, cardnum = cardnum)
                self.db.add(user)
                self.db.commit()

            except IntegrityError,e:#判断手机号是否已被注册
                state = 0
                ret['code'] = 403
                ret['content'] = u'该手机号已被注册'
                self.db.rollback()
            except:
                state = 0
                self.db.rollback()
                ret['code'] = 500
                ret['content'] = u'系统错误'
            if state == 1:
                try:
                    token = uuid.uuid1()
                    ip = self.request.remote_ip
                    access_token = Access_Token(phone = phone,token = token,last_time = int(time.time()), ip=ip)
                    self.db.add(access_token)
                    self.db.commit()
                    ret['content'] = str(token)
                except Exception,e:
                    # print str(e)
                    self.db.rollback()
                    ret['code'] = 500
                    ret['content'] = u'写入错误'
        self.write_back(ret)