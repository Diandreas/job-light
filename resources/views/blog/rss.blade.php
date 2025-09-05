<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Blog Guidy - Conseils CV et Carrière</title>
        <description>Conseils d'experts pour créer un CV parfait et booster votre carrière avec l'IA</description>
        <link>{{ url('/blog') }}</link>
        <atom:link href="{{ url('/blog/rss') }}" rel="self" type="application/rss+xml" />
        <language>fr-FR</language>
        <lastBuildDate>{{ now()->toRSSString() }}</lastBuildDate>
        <generator>Guidy Blog System</generator>
        <image>
            <url>{{ asset('logo.png') }}</url>
            <title>Guidy</title>
            <link>{{ url('/blog') }}</link>
        </image>

        @foreach($posts as $post)
        <item>
            <title><![CDATA[{{ $post->title }}]]></title>
            <description><![CDATA[{{ $post->excerpt }}]]></description>
            <link>{{ route('blog.show', $post->slug) }}</link>
            <guid isPermaLink="true">{{ route('blog.show', $post->slug) }}</guid>
            <pubDate>{{ $post->published_at->toRSSString() }}</pubDate>
            <author>{{ $post->author->email }} ({{ $post->author->name }})</author>
            <category>{{ $post->category }}</category>
            @if($post->featured_image)
            <enclosure url="{{ asset($post->featured_image) }}" type="image/jpeg" />
            @endif
        </item>
        @endforeach
    </channel>
</rss>