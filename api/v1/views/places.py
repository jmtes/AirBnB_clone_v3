#!/usr/bin/python3
"""new view for Place objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.place import Place
from flask import abort, request


@app_views.route('/places', strict_slashes=False)
def all_places():
    """retrieves all places"""
    place_list = []
    for v in storage.all('Place').values():
        place_list.append(v.to_dict())
    return jsonify(place_list), 200


@app_views.route('/places/<place_id>', strict_slashes=False)
def one_place(place_id):
    """retrieve one place"""
    g = storage.get("Place", place_id)
    if g:
        return jsonify(g.to_dict()), 200
    else:
        abort(404)


@app_views.route('/places/<place_id>', methods=['DELETE'],
                 strict_slashes=False)
def del_one_place(place_id):
    """deletes place at passed in place id"""
    g = storage.get("Place", place_id)
    if g:
        storage.delete(g)
        storage.save()
        storage.close()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route('/states/<state_id>/places', methods=['POST'],
                 strict_slashes=False)
def post_places(state_id):
    """posts a specified place"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    if 'name' not in dic:
        return "Missing name", 400
    if not storage.get('State', state_id):
        abort(404)
    else:
        place = Place(**dic)
        setattr(place, 'state_id', state_id)
        storage.new(place)
        storage.save()
        storage.close()
        return jsonify(place.to_dict()), 201


@app_views.route('/places/<place_id>', methods=["PUT"],
                 strict_slashes=False)
def put_place(place_id):
    """puts a specified place"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    else:
        g = storage.get("Place", place_id)
        if g is None:
            abort(404)
        else:
            for attr in dic:
                if attr == "id" or attr == "created_at" or \
                  attr == "updated_at" or attr == 'state_id':
                    continue
                setattr(g, attr, dic[attr])
            storage.save()
            storage.close()
            return jsonify(g.to_dict()), 200


@app_views.route('/cities/<city_id>/places', methods=['GET'],
                 strict_slashes=False)
def get_city_places(city_id):
    ''' Return list of places in a specified city. '''
    g = storage.get('City', city_id)
    if g:
        places = []
        for place in g.places:
            places.append(place.to_dict())
        return jsonify(places), 200
    abort(404)
