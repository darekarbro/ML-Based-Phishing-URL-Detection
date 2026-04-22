import argparse
import requests

API_URL = "http://127.0.0.1:8000/predict"

def main():
    parser = argparse.ArgumentParser(description="Phishing URL Prediction CLI")
    parser.add_argument("url", type=str, help="The URL to test")
    parser.add_argument("--mode", type=str, choices=["fast", "detailed"], default="fast", 
                        help="Inference mode: 'fast' (default) or 'detailed'")
    
    args = parser.parse_args()
    
    payload = {
        "url": args.url,
        "mode": args.mode
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        print("\n" + "="*50)
        print("🔍 Phishing URL Detection Result")
        print("="*50)
        print(f"URL tested : {args.url}")
        print(f"Mode       : {args.mode}")
        print("-" * 50)
        print(f"Score      : {data['probability']}% chance of being a phishing URL")
        print(f"Suggestion : {data['message']}")
        
        if args.mode == "detailed" and 'features' in data:
            print("\n📋 Extracted Features:")
            print("-" * 50)
            for feature, value in data['features'].items():
                print(f"  - {feature:<20}: {value}")
        
        print("="*50 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to the API. Make sure the API is running with 'uvicorn API:app --reload'")
    except requests.exceptions.HTTPError as err:
        print(f"\n❌ API Error: {err}")
        try:
            print(f"Details: {response.json()['detail']}")
        except:
            pass
            
if __name__ == "__main__":
    main()
