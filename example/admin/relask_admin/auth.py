from flask_login import LoginManager

from .models import User
from .models import db

login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id):
    return db.session.query(User).get(user_id)
