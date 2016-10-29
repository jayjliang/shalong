# -*- coding: utf-8 -*-
#!/usr/bin/env python
# @Date    : 2016-02-27 14:20:05
# @Author  : jerry.liangj@qq.com
import json,uuid,time
from sqlalchemy.orm.exc import NoResultFound
from ..Basehandler import BaseHandler
from ..databases.tables import Record

class AdminDealHandler(BaseHandler):
    """
        处理已报名的兼职
    """
    def options(self):
        retjson = {'code':200}
        self.set_header('Access-Control-Allow-Methods','GET')
        self.set_header('Access-Control-Allow-Headers','admin')
        self.write_back(retjson)

    def post(self):
        retjson = {'code':200,'content':'ok'}
        rid = self.get_argument('rid',default=None)
        state = self.get_argument('state',default=None)
        try:
            if not rid:
                retjson['code'] = 400
                retjson['content'] = u'参数缺少'
            if int(state) not in [3,1,2]:
                retjson['code'] = 400
                retjson['content'] = u'参数格式不正确'
            else:
                admin = self.get_current_admin()
                if admin:
                    result = self.db.query(Record).filter(Record.rid==rid).one()
                    result.state = int(state)
                    self.db.add(result)
                    self.db.commit()
                else:
                    retjson['code'] = 401
                    retjson['content'] = u'请先登录'
        except NoResultFound:
            retjson['code'] = 402
            retjson['content'] = u'记录不存在'
        except Exception,e:
            self.db.rollback()
            retjson['code'] = 500
            retjson['content'] = u'系统错误'
        self.write_back(retjson)