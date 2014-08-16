from functools import wraps
import traceback

from flask import jsonify
from flask.json import JSONEncoder


class Jsonifier(JSONEncoder):
    """
    Custom Jsonifier. Looks for __json__ and __serialize__ methods first, then falls back to default.
    """

    def default(self, obj):
        if hasattr(obj, '__json__') and callable(obj.__json__):
            return obj.__json__()
        elif hasattr(obj, '__serialize__') and callable(obj.__serialize__):
            return obj.__serialize__()
        return JSONEncoder.default(self, obj)


def json_service(f):
    """
    Wraps a function that returns a json object.
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            results = f(*args, **kwargs)
            if results is None:
                results = {}
            if not isinstance(results, dict):
                results = {'data': results}
            if 'success' not in results:
                results['success'] = True
            return jsonify(results)
        except Exception as e:
            print traceback.print_exc()
            return jsonify({'success': False, 'error': str(e)})

    return decorated_function