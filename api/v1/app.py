#!/usr/bin/python3
""" version 1 api """
from flask import Flask, Blueprint, request, jsonify
from models import storage
from api.v1.views import app_views
from os import getenv
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(app_views)
CORS(app)
cors = CORS(app, resources={"/*": {"origins": "0.0.0.0"}})


@app.errorhandler(404)
def handle_404(ex):
    ''' Handle 404 error. '''
    return jsonify({'error': 'Not found'}), 404


@app.teardown_appcontext
def teardown(self):
    '''close storage'''
    storage.close()


if __name__ == "__main__":
    app.run(host=getenv('HBNB_API_HOST') or '0.0.0.0',
            port=getenv('HBNB_API_PORT') or 5000,
            threaded=True)
