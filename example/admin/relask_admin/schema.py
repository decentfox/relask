import graphene
from flask import abort
from flask_login import login_required, current_user, login_user
from graphene import relay
from graphene.contrib.sqlalchemy import SQLAlchemyNode, \
    SQLAlchemyConnectionField
from graphene.core.types.custom_scalars import JSONString
from relask import Relask

from . import models

relask = Relask()


@relask.schema.register
class User(SQLAlchemyNode):
    class Meta:
        model = models.User

    @login_required
    def resolve_email(self, args, info):
        if getattr(current_user, 'id', None) == self.instance.id:
            return self.instance.email
        else:
            abort(403)


class Admin(relay.Node):
    title = graphene.String()
    users = SQLAlchemyConnectionField(User)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def resolve_title(self, args, info):
        return 'Relask Admin'

    @classmethod
    def get_node(cls, id_, info):
        return cls(id=id_)

    @classmethod
    def instance(cls):
        return cls.get_node('admin', None)


class Viewer(relay.Node):
    website = graphene.String()
    currentUser = graphene.Field(User)
    isAuthenticated = graphene.Boolean()
    contact = graphene.Field(User)
    admin = graphene.Field(Admin)

    def resolve_website(self, args, info):
        return 'http://decentfox.com'

    def resolve_currentUser(self, args, info):
        uid = current_user.get_id()
        return User.get_node(uid) if uid else None

    def resolve_isAuthenticated(self, args, info):
        return current_user.is_authenticated

    def resolve_contact(self, args, info):
        return User.get_node(1)

    def resolve_admin(self, args, info):
        return Admin.instance()

    @classmethod
    def get_node(cls, id_, info):
        return cls(id=id_)

    @classmethod
    def instance(cls):
        return cls.get_node('viewer', None)


class LoginMutation(relay.ClientIDMutation):
    class Input:
        login = graphene.String()
        password = graphene.String()

    viewer = graphene.Field(Viewer)
    errors = JSONString()

    @classmethod
    def mutate_and_get_payload(cls, args, info):
        import time
        import random
        if random.random() > 0.5:
            time.sleep(3)
        user = models.db.session.query(models.User).filter(
            models.User.login == args.get('login')).first()
        if not user:
            return cls(viewer=Viewer.instance(),
                       errors=dict(login='No such user!'))
        elif user.password == args.get('password'):
            login_user(user)
            return cls(viewer=Viewer.instance())
        else:
            return cls(viewer=Viewer.instance(),
                       errors=dict(password='Wrong password!'))


class Query(graphene.ObjectType):
    node = relay.NodeField()
    viewer = graphene.Field(Viewer)

    def resolve_viewer(self, args, info):
        return Viewer.instance()


class Mutations(graphene.ObjectType):
    login = graphene.Field(LoginMutation)


relask.schema.query = Query
relask.schema.mutation = Mutations
