# -*- coding: utf-8 -*-
#!/usr/bin/env python
import tornado.httpserver
import tornado.ioloop
import tornado.web
import os,json
from tornado.options import define, options

from sqlalchemy.orm import scoped_session, sessionmaker
from mod.auth.login import LoginHandler, InfoGetHandler
from mod.auth.registerHandler import RegisterHandler
from mod.auth.adminLogin import AdminLoginHandler


from mod.item.UserHandler import GetItemListHandler,GetMyItemListHandler
from mod.item.AdminHandler import NewItemHandler,GetAllItemHandler,DownItemHandler

from mod.record.UserNewHandler import NewRecordHandler
from mod.record.UserDeleteHandler import DeleteRecordHandler
from mod.record.AdminGetListHandler import GetCommentHandler
from mod.record.AdminDealHandler import AdminDealHandler

from mod.record.UserNewCommentHandler import NewCommentHandler


from mod.databases.db import engine

define("port", default=8000, help="run on the given port", type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/shalong/auth/login',LoginHandler),
            (r'/shalong/auth/reg',RegisterHandler),
            (r'/shalong/info/get',InfoGetHandler),
            (r'/shalong/admin/login',AdminLoginHandler),
            (r'/shalong/item/list',GetItemListHandler),
            (r'/shalong/item/mylist',GetMyItemListHandler),
            (r'/shalong/item/admin/list',GetAllItemHandler),
            (r'/shalong/item/admin/new',NewItemHandler),
            (r'/shalong/item/admin/down',DownItemHandler),
            (r'/shalong/record/new',NewRecordHandler),
            (r'/shalong/record/delete',DeleteRecordHandler),
            (r'/shalong/comment/admin/list',GetCommentHandler),
            (r'/shalong/record/admin/change',AdminDealHandler),
            (r'/shalong/comment/new',NewCommentHandler),
            (r'/shalong/.*', PageNotFoundHandler)
            ]
        settings = dict(
            cookie_secret="8DB90KLP8371B5AEAC5E64C6042415EE",
            template_path=os.path.join(os.path.dirname(__file__), 'templates'),
            debug=True,
            # autoload=True,
            # autoescape=None
        )
        tornado.web.Application.__init__(self, handlers,**settings)
        self.db = scoped_session(sessionmaker(bind=engine,
                                              autocommit=False, autoflush=True,
                                              expire_on_commit=False))

class PageNotFoundHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('404.html')
    def post(self):
        self.render('404.html')

if __name__ == "__main__":
    tornado.options.parse_command_line()
    Application().listen(options.port)
    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
