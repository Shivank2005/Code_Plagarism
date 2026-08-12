# student_G_unrelated_python.py - Completely different algorithm (Prime Sieve) in Python
def sieve_of_eratosthenes(limit):
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    
    p = 2
    while p * p <= limit:
        if is_prime[p]:
            for multiple in range(p * p, limit + 1, p):
                is_prime[multiple] = False
        p += 1
    
    primes = []
    for num in range(2, limit + 1):
        if is_prime[num]:
            primes.append(num)
    return primes

if __name__ == "__main__":
    result = sieve_of_eratosthenes(100)
    print(f"Found {len(result)} primes:")
    for p in result:
        print(p, end=" ")
