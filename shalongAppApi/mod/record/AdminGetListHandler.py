# -*- coding: utf-8 -*-
#!/usr/bin/env python
# @Date    : 2016-02-27 14:20:05
# @Author  : jerry.liangj@qq.com
import json,uuid,time
from sqlalchemy.orm.exc import NoResultFound
from ..Basehandler import BaseHandler
from ..databases.tables import Record,Users,Comment

class GetCommentHandler(BaseHandler):
    """
    获取指定评论
    """
    def options(self):
        retjson = {'code':200}
        self.set_header('Access-Control-Allow-Methods','GET')
        self.set_header('Access-Control-Allow-Headers','admin')
        self.write_back(retjson)

    def post(self):
        retjson = {'code':200,'content':'ok'}
        iid = self.get_argument('iid',default=None)
        try:
            if not iid:
                retjson['code'] = 400
                retjson['content'] = u'参数缺少'
            else:
                admin = self.get_current_admin()
                if admin:
                    result = self.db.query(Comment,Users).filter(Comment.iid==iid).outerjoin(Users,Comment.phone==Users.phone).all()
                    content = []
                    for i in result:
                        content.append({
                            'cid':i[0].cid,
                            'phone':i[1].phone,
                            'cardnum':i[1].cardnum,
                            'content':i[0].content,
                            'comment_time':self.change_time(i[0].create_time,1)
                        })
                    retjson['content'] = content
                else:
                    retjson['code'] = 401
                    retjson['content'] = u'请先登录'
        except NoResultFound:
            retjson['content'] = []
        except Exception,e:
            self.db.rollback()
            # print str(e)
            retjson['code'] = 500
            retjson['content'] = u'系统错误'
        self.write_back(retjson)