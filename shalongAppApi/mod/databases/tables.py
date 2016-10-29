#!/usr/bin/env python
# -*- coding: utf-8 -*-

from sqlalchemy import Column, Integer, VARCHAR,ForeignKey,Float
from sqlalchemy.orm import relationship,backref
from db import Base

class Users(Base):
	__tablename__ = 'Users'

	phone = Column(VARCHAR(11),nullable=False,primary_key=True)
	password = Column(VARCHAR(32),nullable=False)
	name = Column(VARCHAR(64))
	cardnum = Column(VARCHAR(9),unique=True)
	salt = Column(VARCHAR(64))

class Admin(Base):
	__tablename__ = "Admin"

	phone = Column(VARCHAR(11),nullable=False,primary_key=True)
	password = Column(VARCHAR(32),nullable=False)

class Admin_token(Base):
	__tablename__ = "admin_token"

	phone = Column(VARCHAR(64),ForeignKey('Admin.phone', ondelete='CASCADE'))
	token = Column(VARCHAR(64),nullable=False,primary_key=True)
	last_time = Column(VARCHAR(15))
	ip = Column(VARCHAR(32))


class Access_Token(Base):
	__tablename__ = "Token"

	phone = Column(VARCHAR(64),ForeignKey('Users.phone', ondelete='CASCADE'))
	token = Column(VARCHAR(64),nullable=False,primary_key=True)
	last_time = Column(VARCHAR(15))
	ip = Column(VARCHAR(32))


class Item(Base):
	__tablename__ = "Item"

	iid = Column(Integer,primary_key=True)
	state = Column(Integer,nullable=False)
	topic = Column(VARCHAR(128),nullable=False)
	wanted_number = Column(Integer,nullable=False)
	reg_number = Column(Integer,nullable=False)
	detail = Column(VARCHAR(1024))
	start_time = Column(VARCHAR(15))
	create_time = Column(VARCHAR(15))
	location = Column(VARCHAR(64))
class Record(Base):
	__tablename__ = "Record"

	rid = Column(Integer,primary_key=True)
	phone = Column(VARCHAR(11),ForeignKey('Users.phone', ondelete='CASCADE'))
	iid = Column(Integer,ForeignKey('Item.iid', ondelete='CASCADE'))
	questions = Column(VARCHAR(10240))
	create_time = Column(VARCHAR(15))
	state = Column(Integer)

class Comment(Base):
	__tablename__ = "comment"

	cid = Column(Integer,primary_key=True)
	phone = Column(VARCHAR(11),ForeignKey('Users.phone', ondelete='CASCADE'))
	iid = Column(Integer,ForeignKey('Item.iid', ondelete='CASCADE'))
	create_time = Column(VARCHAR(15))
	content = Column(VARCHAR(10240))



