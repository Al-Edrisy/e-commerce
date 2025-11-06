from elasticsearch import Elasticsearch, NotFoundError
import os
from typing import List, Dict, Any, Optional
import json

class ElasticsearchService:
    def __init__(self):
        self.es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
        self.client = None
        self.index_name = "products"
        self.connect()
    
    def connect(self):
        """Connect to Elasticsearch"""
        try:
            self.client = Elasticsearch([self.es_url])
            if self.client.ping():
                print(f"✅ Elasticsearch connected: {self.es_url}")
                self.create_index()
            else:
                print(f"❌ Elasticsearch connection failed")
        except Exception as e:
            print(f"❌ Elasticsearch error: {e}")
            self.client = None
    
    def create_index(self):
        """Create products index with mapping"""
        if not self.client:
            return False
        
        try:
            # Check if index exists
            if self.client.indices.exists(index=self.index_name):
                print(f"ℹ️  Index '{self.index_name}' already exists")
                return True
            
            # Index mapping
            mapping = {
                "mappings": {
                    "properties": {
                        "id": {"type": "integer"},
                        "name": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"},
                                "suggest": {"type": "completion"}
                            }
                        },
                        "slug": {"type": "keyword"},
                        "sku": {"type": "keyword"},
                        "description": {"type": "text"},
                        "short_description": {"type": "text"},
                        "category_id": {"type": "integer"},
                        "category_name": {"type": "text"},
                        "price": {"type": "float"},
                        "brand": {
                            "type": "text",
                            "fields": {"keyword": {"type": "keyword"}}
                        },
                        "stock_quantity": {"type": "integer"},
                        "is_active": {"type": "boolean"},
                        "is_featured": {"type": "boolean"},
                        "images": {"type": "keyword"},
                        "thumbnail": {"type": "keyword"},
                        "created_at": {"type": "date"},
                        "updated_at": {"type": "date"}
                    }
                }
            }
            
            # Create index
            self.client.indices.create(index=self.index_name, body=mapping)
            print(f"✅ Elasticsearch index '{self.index_name}' created")
            return True
            
        except Exception as e:
            print(f"❌ Error creating index: {e}")
            return False
    
    def index_product(self, product_data: Dict[str, Any]) -> bool:
        """Index a single product"""
        if not self.client:
            return False
        
        try:
            self.client.index(
                index=self.index_name,
                id=product_data["id"],
                document=product_data
            )
            return True
        except Exception as e:
            print(f"❌ Error indexing product: {e}")
            return False
    
    def bulk_index_products(self, products: List[Dict[str, Any]]) -> bool:
        """Bulk index multiple products"""
        if not self.client:
            return False
        
        try:
            from elasticsearch.helpers import bulk
            
            actions = [
                {
                    "_index": self.index_name,
                    "_id": product["id"],
                    "_source": product
                }
                for product in products
            ]
            
            success, failed = bulk(self.client, actions)
            print(f"✅ Indexed {success} products, {failed} failed")
            return True
            
        except Exception as e:
            print(f"❌ Error bulk indexing: {e}")
            return False
    
    def search_products(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Search products with filters"""
        if not self.client:
            return {"products": [], "total": 0}
        
        try:
            # Build query
            must_clauses = []
            
            # Text search
            if query:
                must_clauses.append({
                    "multi_match": {
                        "query": query,
                        "fields": ["name^3", "description", "brand^2", "sku"],
                        "fuzziness": "AUTO"
                    }
                })
            else:
                must_clauses.append({"match_all": {}})
            
            # Filters
            filter_clauses = [{"term": {"is_active": True}}]
            
            if filters:
                if filters.get("category_id"):
                    filter_clauses.append({"term": {"category_id": filters["category_id"]}})
                
                if filters.get("brand"):
                    filter_clauses.append({"term": {"brand.keyword": filters["brand"]}})
                
                if filters.get("min_price") or filters.get("max_price"):
                    price_range = {}
                    if filters.get("min_price"):
                        price_range["gte"] = filters["min_price"]
                    if filters.get("max_price"):
                        price_range["lte"] = filters["max_price"]
                    filter_clauses.append({"range": {"price": price_range}})
                
                if filters.get("in_stock"):
                    filter_clauses.append({"range": {"stock_quantity": {"gt": 0}}})
            
            # Build full query
            search_body = {
                "query": {
                    "bool": {
                        "must": must_clauses,
                        "filter": filter_clauses
                    }
                },
                "from": (page - 1) * page_size,
                "size": page_size,
                "sort": [
                    {"_score": {"order": "desc"}},
                    {"created_at": {"order": "desc"}}
                ]
            }
            
            # Execute search
            response = self.client.search(index=self.index_name, body=search_body)
            
            # Format results
            products = [hit["_source"] for hit in response["hits"]["hits"]]
            total = response["hits"]["total"]["value"]
            
            return {
                "products": products,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size
            }
            
        except Exception as e:
            print(f"❌ Search error: {e}")
            return {"products": [], "total": 0}
    
    def suggest_products(self, prefix: str, size: int = 5) -> List[str]:
        """Get product name suggestions"""
        if not self.client:
            return []
        
        try:
            response = self.client.search(
                index=self.index_name,
                body={
                    "suggest": {
                        "product-suggest": {
                            "prefix": prefix,
                            "completion": {
                                "field": "name.suggest",
                                "size": size,
                                "skip_duplicates": True
                            }
                        }
                    }
                }
            )
            
            suggestions = []
            for option in response["suggest"]["product-suggest"][0]["options"]:
                suggestions.append(option["text"])
            
            return suggestions
            
        except Exception as e:
            print(f"❌ Suggestion error: {e}")
            return []
    
    def delete_product(self, product_id: int) -> bool:
        """Delete product from index"""
        if not self.client:
            return False
        
        try:
            self.client.delete(index=self.index_name, id=product_id)
            return True
        except NotFoundError:
            return False
        except Exception as e:
            print(f"❌ Delete error: {e}")
            return False
    
    def health_check(self) -> bool:
        """Check Elasticsearch health"""
        if not self.client:
            return False
        return self.client.ping()

# Singleton instance
es_service = ElasticsearchService()