#!/usr/bin/python3
"""new view for User objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.user import User
from flask import abort, request


@app_views.route('/users', strict_slashes=False)
def all_users():
    """retrieves all users"""
    user_list = []
    for v in storage.all('User').values():
        user_list.append(v.to_dict())
    return jsonify(user_list)


@app_views.route('/users/<user_id>', strict_slashes=False)
def one_user(user_id):
    """retrieve one user"""
    g = storage.get("User", user_id)
    if g:
        return jsonify(g.to_dict())
    else:
        abort(404)


@app_views.route('/users/<user_id>', methods=['DELETE'],
                 strict_slashes=False)
def del_one_user(user_id):
    """deletes user at passed in user id"""
    g = storage.get("User", user_id)
    if g:
        storage.delete(g)
        storage.save()
        storage.close()
        return '{}\n'
    else:
        abort(404)


@app_views.route('/users', methods=['POST'], strict_slashes=False)
def post_users():
    """posts a specified user"""
    try:
        dic = request.get_json()
    except Exception:
        abort(400, 'Not a JSON')
    if 'email' not in dic:
        abort(400, "Missing email")
    if 'password' not in dic:
        abort(400, 'Missing password')
    else:
        user = User(**dic)
        storage.new(user)
        storage.save()
        storage.close()
        return jsonify(user.to_dict()), 201


@app_views.route('/users/<user_id>', methods=["PUT"],
                 strict_slashes=False)
def put_user(user_id):
    """puts a specified user"""
    try:
        dic = request.get_json()
    except Exception:
        abort(400, 'Not a JSON')
    if 'name' not in dic:
        abort(400, "Missing name")
    else:
        g = storage.get("User", user_id)
        if g is None:
            abort(404)
        else:
            for attr in dic:
                if attr == "id" or attr == "created_at" or \
                  attr == "updated_at" or attr == 'email':
                    continue
                setattr(g, attr, dic[attr])
            storage.save()
            storage.close()
            return jsonify(g.to_dict()), 200
