# aac_crud.py — Enhanced NO-AUTH Version for CS 499 (Database Category)
# Author: Julliane Pamfilo
#
# In this enhanced version, I focused on writing clean, maintainable, and secure
# CRUD operations while adjusting the connection logic to match the configuration
# of my current Codio environment. This machine runs MongoDB without access control
# enabled, which means authentication is not supported. To keep the project
# functional and compliant with CS 499 expectations, I refactored the constructor
# to connect without username/password authentication. All other enhancements—
# validation, error handling, documentation, and safe CRUD logic—remain intact.

from __future__ import annotations
from typing import Any, Dict, List, Optional
from pymongo import MongoClient
from pymongo.errors import PyMongoError


class AnimalShelter:
    """
    This class manages all CRUD operations for the AAC MongoDB dataset.
    Because my Codio environment is running MongoDB in open/no-auth mode,
    I removed authentication parameters from the constructor. My goal was to
    keep the class secure, modular, and professional while ensuring it works
    reliably in this execution environment.
    """

    def __init__(
        self,
        host: str = "localhost",
        port: int = 27017,
        db_name: str = "aac",
        collection_name: str = "animals",
    ) -> None:
        """
        Establish a no-auth MongoDB connection.

        In CS 340, authentication was enabled, but in this Codio box MongoDB is
        configured without access control. Because of that, any attempt to
        authenticate will always fail. To maintain functionality, I connect using
        a simple URI without credentials.
        """

        uri = f"mongodb://{host}:{port}/"

        try:
            self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            self.database = self.client[db_name]
            self.collection = self.database[collection_name]

            # Quick health check. If this fails, I know immediately.
            self.client.admin.command("ping")

        except PyMongoError as e:
            raise RuntimeError(f"MongoDB connection failed: {e}")

    # -----------------------------------------------------------
    # CREATE
    # -----------------------------------------------------------
    def create(self, data: Dict[str, Any]) -> Optional[str]:
        """
        Insert one validated document.
        I intentionally enforce that the data must be a non-empty dictionary
        to prevent accidental empty writes or malicious inputs.
        """
        if not isinstance(data, dict) or not data:
            raise ValueError("Create failed: data must be a non-empty dictionary.")

        try:
            result = self.collection.insert_one(data)
            return str(result.inserted_id)
        except PyMongoError as e:
            raise RuntimeError(f"Create failed: {e}")

    # -----------------------------------------------------------
    # READ MULTIPLE
    # -----------------------------------------------------------
    def read(
        self,
        query: Optional[Dict[str, Any]] = None,
        projection: Optional[Dict[str, int]] = None,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Return a list of matching documents.
        I apply safe projections and validate the query to avoid malformed
        lookups. This reinforces a security-focused mindset even in no-auth mode.
        """
        if query is not None and not isinstance(query, dict):
            raise ValueError("Read failed: query must be a dictionary.")

        proj = projection if projection is not None else {"_id": 0}

        try:
            cursor = self.collection.find(query or {}, proj)

            if limit is not None:
                if not isinstance(limit, int):
                    raise ValueError("Limit must be an integer.")
                cursor = cursor.limit(limit)

            return list(cursor)

        except PyMongoError as e:
            raise RuntimeError(f"Read failed: {e}")

    # -----------------------------------------------------------
    # READ ONE
    # -----------------------------------------------------------
    def read_one(
        self,
        query: Dict[str, Any],
        projection: Optional[Dict[str, int]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve one single document that matches the query.
        """
        if not isinstance(query, dict) or not query:
            raise ValueError("read_one requires a non-empty query dictionary.")

        proj = projection if projection is not None else {"_id": 0}

        try:
            return self.collection.find_one(query, proj)
        except PyMongoError as e:
            raise RuntimeError(f"Read one failed: {e}")

    # -----------------------------------------------------------
    # READ ALL
    # -----------------------------------------------------------
    def read_all(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Convenience method that returns full dataset.
        Useful for table initialization and testing.
        """
        return self.read({}, {"_id": 0}, limit)

    # -----------------------------------------------------------
    # UPDATE
    # -----------------------------------------------------------
    def update(
        self,
        query: Dict[str, Any],
        new_values: Dict[str, Any],
        many: bool = True,
    ) -> int:
        """
        Update documents safely using $set.
        I protect against empty queries and empty updates to prevent accidental
        mass updates or silent failures.
        """
        if not isinstance(query, dict) or not query:
            raise ValueError("Update failed: query must be a non-empty dictionary.")

        if not isinstance(new_values, dict) or not new_values:
            raise ValueError("Update failed: new_values must be a non-empty dictionary.")

        try:
            if many:
                result = self.collection.update_many(query, {"$set": new_values})
            else:
                result = self.collection.update_one(query, {"$set": new_values})
            return int(result.modified_count)
        except PyMongoError as e:
            raise RuntimeError(f"Update failed: {e}")

    # -----------------------------------------------------------
    # DELETE
    # -----------------------------------------------------------
    def delete(self, query: Dict[str, Any], many: bool = True) -> int:
        """
        Delete documents safely.
        I block empty queries to avoid accidental deletion of the entire
        collection, which is a common beginner mistake.
        """
        if not isinstance(query, dict) or not query:
            raise ValueError("Delete failed: query must be a non-empty dictionary.")

        try:
            if many:
                result = self.collection.delete_many(query)
            else:
                result = self.collection.delete_one(query)
            return int(result.deleted_count)
        except PyMongoError as e:
            raise RuntimeError(f"Delete failed: {e}")

    # -----------------------------------------------------------
    # COUNT
    # -----------------------------------------------------------
    def count(self, query: Optional[Dict[str, Any]] = None) -> int:
        """
        Count matching documents.
        I validate the input and return the count as an integer.
        """
        if query is not None and not isinstance(query, dict):
            raise ValueError("Count failed: query must be a dictionary.")

        try:
            return int(self.collection.count_documents(query or {}))
        except PyMongoError as e:
            raise RuntimeError(f"Count failed: {e}")

