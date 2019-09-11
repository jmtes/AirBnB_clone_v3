#!/usr/bin/python3
"""new view for City objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.city import City
from flask import abort, request


@app_views.route('/cities', strict_slashes=False)
def all_cities():
    """retrieves all cities"""
    city_list = []
    for v in storage.all('City').values():
        city_list.append(v.to_dict())
    return jsonify(city_list), 200


@app_views.route('/cities/<city_id>', strict_slashes=False)
def one_city(city_id):
    """retrieve one city"""
    g = storage.get("City", city_id)
    if g:
        return jsonify(g.to_dict()), 200
    else:
        abort(404)


@app_views.route('/cities/<city_id>', methods=['DELETE'],
                 strict_slashes=False)
def del_one_city(city_id):
    """deletes city at passed in city id"""
    g = storage.get("City", city_id)
    if g:
        storage.delete(g)
        storage.save()
        storage.close()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route('/states/<state_id>/cities', methods=['POST'],
                 strict_slashes=False)
def post_cities(state_id):
    """posts a specified city"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    if 'name' not in dic:
        return "Missing name", 400
    if not storage.get('State', state_id):
        abort(404)
    else:
        city = City(**dic)
        setattr(city, 'state_id', state_id)
        storage.new(city)
        storage.save()
        storage.close()
        return jsonify(city.to_dict()), 201


@app_views.route('/cities/<city_id>', methods=["PUT"],
                 strict_slashes=False)
def put_city(city_id):
    """puts a specified city"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    else:
        g = storage.get("City", city_id)
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


@app_views.route('/states/<state_id>/cities', methods=['GET'],
                 strict_slashes=False)
def get_state_cities(state_id):
    ''' Return list of cities in a specified state. '''
    g = storage.get('State', state_id)
    if g:
        cities = []
        for city in g.cities:
            cities.append(city.to_dict())
        return jsonify(cities), 200
    abort(404)
