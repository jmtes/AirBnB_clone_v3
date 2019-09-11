#!/usr/bin/python3
''' Define route for app views.

    Attributes:
        json_check - Return page status.
'''
from api.v1.views import app_views
from flask import jsonify
from models import storage


@app_views.route('/status', strict_slashes=False)
def json_check():
    ''' Return page status. '''
    return jsonify(status='OK')


@app_views.route('/stats'strict_slashes=False)
def count_objects():
    ''' Return count of objects by type. '''
    return jsonify(amenities=storage.count('Amenity'),
                   cities=storage.count('City'),
                   places=storage.count('Place'),
                   reviews=storage.count('Review'),
                   states=storage.count('State'),
                   users=storage.count('User')), 200
