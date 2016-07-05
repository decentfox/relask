from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    name = db.Column(db.String)
    email = db.Column(db.String)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)


def init_app(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_ECHO'] = True
    db.init_app(app)
    with app.app_context():
        db.create_all()
        db.session.add(User(
            login='decent', password='fox',
            name='DecentFoX Studio', email='support@decentfox.com'))
        db.session.add(User(
            login='guest', password='guest',
            name='Guest', email='guest@decentfox.com'))
        db.session.commit()
