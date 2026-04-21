import re
from urllib.parse import urlparse, parse_qs
import tldextract

# Suspicious TLDs often used for phishing
SUSPICIOUS_TLDS = {
    'xyz', 'club', 'top', 'online', 'vip', 'site', 'work', 'shop', 
    'info', 'tk', 'ml', 'ga', 'cf', 'gq', 'fit', 'icu', 'cam', 'date'
}

# Common URL shorteners
SHORTENERS = {
    'bit.ly', 'goo.gl', 'tinyurl.com', 'is.gd', 'cli.gs', 
    'yfrog.com', 'migre.me', 'ff.im', 'tiny.cc', 'url4.eu',
    'twit.ac', 'su.pr', 'twurl.nl', 'snipurl.com', 'short.to',
    'BudURL.com', 'ping.fm', 'post.ly', 'Just.as', 'bkite.com',
    'snipr.com', 'fic.kr', 'loopt.us', 'doiop.com', 'short.ie',
    'kl.am', 'wp.me', 'rubyurl.com', 'om.ly', 'to.ly', 'bit.do',
    't.co', 'lnkd.in', 'db.tt', 'qr.ae', 'adf.ly', 'bitly.com',
    'cutt.ly', 'v.gd', 'bl.ink'
}

# Common keywords used in phishing attacks
PHISH_KEYWORDS = [
    'login', 'signin', 'verify', 'update', 'secure', 'account', 'banking', 
    'auth', 'confirm', 'password', 'recover', 'billing', 'admin', 'service', 
    'support', 'security', 'validate', 'credential', 'wallet', 'free'
]

def extract_features(url):
    """
    Extracts exactly 20 features from a given URL for phishing detection.
    Returns a dictionary of features.
    """
    if not url.startswith('http'):
        url = 'http://' + url
        
    parsed_url = urlparse(url)
    ext = tldextract.extract(url)
    
    features = {}

    # ---------------- 🔹 Structure Features (7) ----------------
    features['url_length'] = len(url)
    features['hostname_length'] = len(parsed_url.netloc)
    features['count.'] = url.count('.')
    features['count-digits'] = sum(c.isdigit() for c in url)
    features['count-'] = url.count('-')
    features['count@'] = url.count('@')
    features['count%'] = url.count('%')

    # ---------------- 🔹 Domain Features (4) ----------------
    # Subdomain count: usually www doesn't count as a suspicious subdomain
    subdomain = ext.subdomain
    if subdomain.startswith('www.'):
        subdomain = subdomain[4:]
    elif subdomain == 'www':
        subdomain = ''
    features['subdomain_count'] = len(subdomain.split('.')) if subdomain else 0
    
    features['suspicious_tld'] = 1 if ext.suffix in SUSPICIOUS_TLDS else 0
    
    # Check if domain is an IP address
    features['use_of_ip'] = 1 if re.match(r'^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$', ext.domain) else 0
    
    features['has_https'] = 1 if parsed_url.scheme == 'https' else 0

    # ---------------- 🔹 Path / Behavior Features (5) ----------------
    features['path_length'] = len(parsed_url.path)
    
    # Length of first directory
    path_parts = [p for p in parsed_url.path.split('/') if p]
    features['fd_length'] = len(path_parts[0]) if path_parts else 0
    
    features['path_depth'] = len(path_parts)
    
    query = parse_qs(parsed_url.query)
    features['query_param_count'] = len(query)
    
    # Check if TLD (like .com) appears in the path (e.g., domain.com/login.com)
    features['tld_in_path'] = 1 if ext.suffix and ext.suffix in parsed_url.path else 0

    # ---------------- 🔹 Security Trick Features (3) ----------------
    # Double extension check in path (e.g., file.txt.exe)
    features['double_extension'] = 1 if re.search(r'\.[a-z]{2,5}\.[a-z]{2,5}(/|$)', parsed_url.path, re.IGNORECASE) else 0
    
    features['has_fragment'] = 1 if parsed_url.fragment else 0
    
    features['short_url'] = 1 if parsed_url.netloc in SHORTENERS else 0

    # ---------------- 🔹 Intent Feature (1) ----------------
    features['phish_keyword'] = 1 if any(keyword in url.lower() for keyword in PHISH_KEYWORDS) else 0

    return features

def extract_features_list(url):
    """
    Returns the features as a list (useful for model prediction).
    Order is consistent with the dictionary keys.
    """
    features = extract_features(url)
    return list(features.values())

def get_feature_names():
    """
    Returns the list of feature names in the correct order.
    """
    return list(extract_features('http://example.com').keys())
