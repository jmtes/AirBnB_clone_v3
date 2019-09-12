#!/usr/bin/python3
"""new view for City objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.place import Place
from models.amenity import Amenity
from flask import abort, request


@app_views.route('/places/<place_id>/amenities', strict_slashes=False)
def all_place_amenities(place_id):
    """retrieves all amenities"""
    g = storage.get("Place", place_id)
    if not g:
        abort(404)
    else:
        amenity_list = []
        for v in g.amenities:
            amenity_list.append(v.to_dict())
    return jsonify(amenity_list), 200


@app_views.route('/places/<place_id>/amenities/<amenity_id>',
                 methods=['DELETE'], strict_slashes=False)
def del_one_place_amenity(place_id, amenity_id):
    """deletes amenity at place id"""
    place = storage.get("Place", place_id)
    if place:
        amen = storage.get("Amenity", amenity_id)
        if amen and amen in place.amenities:
            del(place.amenities[place.amenities.index(amen)])
            storage.save()
            storage.close()
            return jsonify({}), 200
        else:
            abort(404)
    else:
        abort(404)


@app_views.route('/places/<place_id>/amenities/<amenity_id>',
                 methods=['POST'], strict_slashes=False)
def post_place_amenity(place_id, amenity_id):
    """posts a specified amenity at place id"""
    place = storage.get("Place", place_id)
    amen = storage.get("Amenity", amenity_id)
    if place and amen:
        if amen in place.amenities:
            return jsonify(amen.to_dict()), 200
        else:
            place.amenities.append("amen")
            storage.save()
            storage.close()
            return jsonify(amen.to_dict()), 201
    else:
        abort(404)
