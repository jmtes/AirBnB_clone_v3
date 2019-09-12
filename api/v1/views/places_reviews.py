#!/usr/bin/python3
"""new view for City objects"""
from flask import jsonify
from api.v1.views import app_views
from models import storage
from models.place import Place
from models.review import Review
from flask import abort, request


@app_views.route('/places/<place_id>/reviews', strict_slashes=False)
def all_reviews(place_id):
    """retrieves all reviews"""
    g = storage.get("Place", place_id)
    if not g:
        abort(404)
    else:
        review_list = []
        for v in g.reviews:
            review_list.append(v.to_dict())
    return jsonify(review_list), 200


@app_views.route('/reviews/<review_id>', strict_slashes=False)
def one_review(review_id):
    """retrieve one review"""
    g = storage.get("Review", review_id)
    if g:
        return jsonify(g.to_dict()), 200
    else:
        abort(404)


@app_views.route('/reviews/<review_id>', methods=['DELETE'],
                 strict_slashes=False)
def del_one_review(review_id):
    """deletes review at passed in city id"""
    g = storage.get("Review", review_id)
    if g:
        storage.delete(g)
        storage.save()
        storage.close()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route('/places/<place_id>/reviews', methods=['POST'],
                 strict_slashes=False)
def post_review(place_id):
    """posts a specified reviews"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    if 'user_id' not in dic:
        return "Missing user_id", 400
    if not storage.get('User', dic.get('user_id')):
        abort(404)
    if 'text' not in dic:
        return 'Missing text', 400
    if not storage.get('Place', place_id):
        abort(404)
    else:
        review = Review(**dic)
        setattr(review, 'place_id', place_id)
        storage.new(review)
        storage.save()
        storage.close()
        return jsonify(review.to_dict()), 201


@app_views.route('/reviews/<review_id>', methods=["PUT"],
                 strict_slashes=False)
def put_review(review_id):
    """puts a specified review"""
    dic = request.get_json()
    if not dic:
        return 'Not a JSON', 400
    else:
        g = storage.get("Review", review_id)
        if g is None:
            abort(404)
        else:
            for attr in dic:
                if attr == "id" or attr == "created_at" or \
                  attr == "updated_at" or attr == 'user_id' or \
                  attr == 'place_id':
                    continue
                setattr(g, attr, dic[attr])
            storage.save()
            storage.close()
            return jsonify(g.to_dict()), 200
