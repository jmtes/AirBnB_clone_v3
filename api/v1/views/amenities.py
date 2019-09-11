#!/usr/bin/python3
"""new view for Amenity objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.amenity import Amenity
from flask import abort, request


@app_views.route('/amenities', strict_slashes=False)
def all_amenities():
    """retrieves all amenities"""
    amenity_list = []
    for v in storage.all('Amenity').values():
        amenity_list.append(v.to_dict())
    return jsonify(amenity_list)


@app_views.route('/amenities/<amenity_id>', strict_slashes=False)
def one_amenity(amenity_id):
    """retrieve one amenity"""
    g = storage.get("Amenity", amenity_id)
    if g:
        return jsonify(g.to_dict())
    else:
        abort(404)


@app_views.route('/amenities/<amenity_id>', methods=['DELETE'],
                 strict_slashes=False)
def del_one_amenity(amenity_id):
    """deletes Amenity at passed in amenity id"""
    g = storage.get("Amenity", amenity_id)
    if g:
        storage.delete(g)
        storage.save()
        storage.close()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route('/amenities', methods=['POST'], strict_slashes=False)
def post_amenities():
    """posts a specified amenity"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    if 'name' not in dic:
        return "Missing name", 400
    else:
        amenity = Amenity(**dic)
        storage.new(amenity)
        storage.save()
        storage.close()
        return jsonify(amenity.to_dict()), 201


@app_views.route('/amenities/<amenity_id>', methods=["PUT"],
                 strict_slashes=False)
def put_amenity(amenity_id):
    """puts a specified amenity"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    if 'name' not in dic:
        return "Missing name", 400
    else:
        g = storage.get("Amenity", amenity_id)
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
