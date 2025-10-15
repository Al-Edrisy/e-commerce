from elasticsearch import Elasticsearch
import os

ELASTICSEARCH_URL = os.getenv('ELASTICSEARCH_URL', 'http://localhost:9200')

es = Elasticsearch([ELASTICSEARCH_URL])

def check_elasticsearch_connection():
    """
    Check if Elasticsearch is available
    """
    try:
        if es.ping():
            print("Connected to Elasticsearch")
            return True
        else:
            print("Elasticsearch is not available")
            return False
    except Exception as e:
        print(f"Error connecting to Elasticsearch: {e}")
        return False

def create_products_index():
    """
    Create products index in Elasticsearch with enhanced meta fields
    """
    index_name = "products"
    
    if not es.indices.exists(index=index_name):
        mapping = {
            "mappings": {
                "properties": {
                    # Basic product fields
                    "id": {"type": "integer"},
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "suggest": {
                                "type": "completion"
                            },
                            "keyword": {
                                "type": "keyword"
                            }
                        }
                    },
                    "description": {"type": "text"},
                    "price": {"type": "float"},
                    "stock": {"type": "integer"},
                    "image_url": {"type": "keyword"},
                    "category_id": {"type": "integer"},
                    "category_name": {"type": "keyword"},
                    
                    # Meta fields for e-commerce
                    "sku": {"type": "keyword"},
                    "brand": {"type": "keyword"},
                    "weight": {"type": "float"},
                    "dimensions": {"type": "keyword"},
                    "color": {"type": "keyword"},
                    "size": {"type": "keyword"},
                    "is_featured": {"type": "boolean"},
                    "is_digital": {"type": "boolean"},
                    "requires_shipping": {"type": "boolean"},
                    "tax_rate": {"type": "float"},
                    "discount_percentage": {"type": "float"},
                    
                    # SEO fields
                    "seo_title": {"type": "text"},
                    "seo_description": {"type": "text"},
                    "meta_keywords": {"type": "text"},
                    
                    # Analytics fields
                    "view_count": {"type": "integer"},
                    "purchase_count": {"type": "integer"},
                    "rating_avg": {"type": "float"},
                    "rating_count": {"type": "integer"},
                    
                    # Timestamps
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"}
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "product_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "stop", "snowball"]
                        }
                    }
                }
            }
        }
        es.indices.create(index=index_name, body=mapping)
        print(f"Created enhanced index: {index_name}")
    else:
        print(f"Index {index_name} already exists")

def index_product(product_data):
    """
    Index a single product in Elasticsearch
    """
    try:
        es.index(index="products", id=product_data["id"], body=product_data)
        print(f"Indexed product: {product_data['name']}")
        return True
    except Exception as e:
        print(f"Error indexing product: {e}")
        return False

def delete_product_from_index(product_id):
    """
    Delete a product from Elasticsearch index
    """
    try:
        es.delete(index="products", id=product_id)
        print(f"Deleted product from index: {product_id}")
        return True
    except Exception as e:
        print(f"Error deleting product from index: {e}")
        return False

def update_product_in_index(product_data):
    """
    Update a product in Elasticsearch index
    """
    try:
        es.index(index="products", id=product_data["id"], body=product_data)
        print(f"Updated product in index: {product_data['name']}")
        return True
    except Exception as e:
        print(f"Error updating product in index: {e}")
        return False

