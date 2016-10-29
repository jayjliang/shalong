#!/usr/bin/env python
# -*- coding: utf-8 -*-
from db import engine, Base
from tables import  Access_Token,Users,Item,Record,Admin,Admin_token
Base.metadata.create_all(engine) #create all of Class which belonged to Base Class