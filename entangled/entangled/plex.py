import abc
import functools

from entangled.logger import logger


class PlexApi(abc.ABC):
    @abc.abstractmethod
    def current_movie_time(self):
        pass

    @abc.abstractmethod
    def seek_to(self, hour, minute, second):
        pass

    @abc.abstractmethod
    def play(self):
        pass


def record_mock_call(func):
    @functools.wraps(func)
    def func_with_logging(self, *args, **kwargs):
        if args:
            formatted_mock_call = f"{func.__name__} {' '.join(map(str, args))}"
        else:
            formatted_mock_call = f"{func.__name__}"

        self.mock_calls.append(formatted_mock_call)
        return func(self, *args, **kwargs)

    return func_with_logging


class MockPlexApi(PlexApi):
    def __init__(self):
        self.mock_current_movie_time = ''
        self.mock_calls = []

    @record_mock_call
    def current_movie_time(self):
        return self.mock_current_movie_time

    @record_mock_call
    def seek_to(self, hour, minute, second):
        pass

    @record_mock_call
    def play(self):
        pass


class PythonLibPlexApi(PlexApi):
    """
    TODO: See 'plexClientApi' experiment for impl
    """

    def current_movie_time(self):
        logger.info('Getting current movie time')
        return "1:23:45"

    def seek_to(self, hour, minute, second):
        logger.info(f"Seeking to: '{hour}:{minute}:{second}")

    def play(self):
        logger.info('Playing')
        pass
