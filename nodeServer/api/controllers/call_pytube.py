from pytube import YouTube
from sys import argv

def main():
    if (len(argv) < 1):
        # put exception handling here if needed
        return False
    
    youtube_url = argv[1]
    
    # get youtube object by passing youtube url to constructor
    yt    = YouTube(youtube_url)
    stream = yt.streams.first()
    
    #get download url
    print(stream.url)

if __name__ == "__main__":
        main()