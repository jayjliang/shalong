# -*- coding: utf-8 -*-
#!/usr/bin/env python
# @Date    : 2015-11-18 21:20:05
# @Author  : jerry.liangj@qq.com
from ..Basehandler import BaseHandler
import traceback
from ..databases.tables import Record,Item
from time import time
from sqlalchemy.exc import IntegrityError

class NewRecordHandler(BaseHandler):
    def options(self):
        retjson = {'code':200}
        self.set_header('Access-Control-Allow-Methods','GET')
        self.set_header('Access-Control-Allow-Headers','token')
        self.write_back(retjson)

    def post(self):
        """
        state:
            3:已评价
            1:已报名
            2:已结束
        """
        retjson = {'code':200,'content':'ok'}
        token = self.get_current_user()
        if not token:
            retjson['code'] = 400
            retjson['content'] = u'请先登录'
        else:
            try:
                phone = token.phone
                iid = self.get_argument("iid",default=None)
                questions = self.get_argument("questions",default=None)
                if not iid or not questions:
                    retjson['code'] = 401
                    retjson['content'] = u'缺少参数'
                else:
                    item_db = self.db.query(Item).filter(Item.iid==iid).all()
                    record_db = self.db.query(Record).filter(Record.iid==iid, Record.phone == token.phone).all()
                    if len(item_db) < 1:
                        retjson['code'] = 403
                        retjson['content'] = u'沙龙不存在'
                    if len(record_db) > 0:
                        retjson['code'] = 403
                        retjson['content'] = u'不能重复报名'
                    if int(item_db[0].start_time) < int(time()) + 43200:
                        retjson['code'] = 403
                        retjson['content'] = u'沙龙已结束'
                    else:
                        if item_db[0].reg_number >= item_db[0].wanted_number:
                            retjson['code'] = 402
                            retjson['content'] = u'人数已满'
                        else:
                            record = Record(phone=phone,iid=iid,state=1,create_time=int(time()), questions = questions)
                            item_db[0].reg_number += 1
                            self.db.add(record)
                            self.db.add(item_db[0])
                            self.db.commit()
            except IntegrityError:
                retjson['code'] = 403
                retjson['content'] = u'沙龙不存在'
            except Exception,e:
                # print traceback.print_exc()
                retjson['code'] = 500
                retjson['content'] = u'系统错误'
        self.write_back(retjson)
