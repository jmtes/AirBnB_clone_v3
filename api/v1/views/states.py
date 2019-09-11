#!/usr/bin/python3
"""new view for states objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.state import State
from flask import abort, request


@app_views.route('/states', strict_slashes=False)
def all_states():
    """retrieves all states"""
    state_list = []
    for v in storage.all('State').values():
        state_list.append(v.to_dict())
    return jsonify(state_list)


@app_views.route('/states/<state_id>', strict_slashes=False)
def one_state(state_id):
    """retrieve one state"""
    g = storage.get("State", state_id)
    if g:
        return jsonify(g.to_dict())
    else:
        abort(404)


@app_views.route('/states/<state_id>', methods=['DELETE'],
                 strict_slashes=False)
def del_one_state(state_id):
    """deletes state at passed in state id"""
    g = storage.get("State", state_id)
    if g:
        storage.delete(g)
        storage.save()
        storage.close()
        return '{}\n'
    else:
        abort(404)


@app_views.route('/states', methods=['POST'], strict_slashes=False)
def post_states():
    """posts a specified state"""
    try:
        dic = request.get_json()
    except Exception:
        abort(400, 'Not a JSON')
    if 'name' not in dic:
        abort(400, "Missing name")
    else:
        state = State(**dic)
        storage.new(state)
        storage.save()
        storage.close()
        return jsonify(state.to_dict()), 201


@app_views.route('/states/<state_id>', methods=["PUT"],
                 strict_slashes=False)
def put_state(state_id):
    """puts a specified state"""
    try:
        dic = request.get_json()
    except Exception:
        abort(400, 'Not a JSON')
    if 'name' not in dic:
        abort(400, "Missing name")
    else:
        g = storage.get("State", state_id)
        if g is None:
            abort(404)
        else:
            for attr in dic:
                if attr == "id" or attr == "created_at" or \
                  attr == "updated_at":
                    continue
                setattr(g, attr, dic[attr])
            storage.save()
            storage.close()
            return jsonify(g.to_dict()), 200
