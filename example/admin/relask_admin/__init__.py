from flask import Flask

from . import models
from .auth import login_manager
from .schema import relask

app = Flask(__name__)
app.secret_key = 'blablabla'
login_manager.init_app(app)
relask.init_app(app)
models.init_app(app)
