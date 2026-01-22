export const MOVIE_RECS_CODE = `import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from difflib import SequenceMatcher

movie_data = pd.read_csv('/Users/jashbhatt/Desktop/Python Projects/movie_metadata.csv')
print(movie_data.head())
print(movie_data.columns)
movie_data = movie_data.astype(object).fillna('')
movie_data['combined_features'] = (movie_data['genres'] + ' ' + movie_data['director_name'] + ' ' + movie_data['actor_1_name'] + ' ' + movie_data['actor_2_name'] + ' ' + movie_data['actor_3_name'] + ' ' + movie_data['country'])
count_vectorizer = CountVectorizer()
count_matrix = count_vectorizer.fit_transform(movie_data['combined_features'])
cosine_sim = cosine_similarity(count_matrix)

def get_recommendations(movie_title, cosine_sim, movie_data):
    def fuzzy_match(title):
        return max(SequenceMatcher(None, title, movie_title).ratio(), SequenceMatcher(None, movie_title, title).ratio())
    try:
        idx= movie_data['movie_title'].apply(fuzzy_match).idxmax()
    except ValueError:
        print(f"Movie: '{movie_title}'not found in the dataset.")
        return[]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key = lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11]
    movie_indices = [i[0] for i in sim_scores]
    return movie_data['movie_title'].iloc[movie_indices]

user_input_movie = input("Enter the title of the movie you liked: ")
recommendations = get_recommendations(user_input_movie, cosine_sim, movie_data)

if recommendations.any():
    print(f"Movies similar to '{user_input_movie}': ")
    print(recommendations)
`;
