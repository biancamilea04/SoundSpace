"use client";

import "./PostsGatePreview.css";

const SKELETON_POSTS = [
    { bodyLines: 2, likeClass: "pgp__like--wide" },
    { bodyLines: 1, likeClass: "pgp__like--narrow" },
] as const;

const PostsGatePreview = () => (
    <div className="pgp">
        {SKELETON_POSTS.map((post, i) => (
            <div key={i} className="pgp__post">
                <div className="pgp__post-header">
                    <div className="pgp__avatar" />
                    <div className="pgp__meta">
                        <div className="pgp__name" />
                        <div className="pgp__time" />
                    </div>
                </div>
                <div className="pgp__body">
                    <div className="pgp__line pgp__line--full" />
                    {post.bodyLines === 2 && <div className="pgp__line pgp__line--partial" />}
                </div>
                <div className="pgp__footer">
                    <div className={`pgp__like ${post.likeClass}`} />
                </div>
            </div>
        ))}
    </div>
);

export default PostsGatePreview;
