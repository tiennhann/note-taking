import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { fileURLToPath } from "url";
import exp from "constants";

export const archive = mutation({
    args: {id: v.id("documents")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error ("Not authenticated user");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if(!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveArchive = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parents", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentDocument", documentId)
                ))
                .collect();
                
                for (const child of children) {
                    await ctx.db.patch(child._id, {
                        isArchived: true,
                    });

                    await recursiveArchive(child._id);
                }
        }
        
        const document = await ctx.db.patch(args.id, {
            isArchived: true,
        });

        recursiveArchive(args.id);
        
        return document;
    }
})

export const getSidebar = query({
    args:{
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        // User identity check, it checks if user is authenticated 
        // by verifying the identity exists or not
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error ("Not authenticated user");
        }

        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            // Uses an index by_user_parents to fletch documents
            // by user ID and parent document ID. 
            .withIndex("by_user_parents", (q) =>
                q
                    .eq("userId", userId)
                    .eq("parentDocument", args.parentDocument)
                )
                // Filters documensts to exclude those are archived
                .filter((q) =>
                    q.eq(q.field("isArchived"), false)
                )
                // Orders the results in descending order
                .order("desc")
                .collect();
        return documents;
    }
});


export const create = mutation({
    args: {
        title: v.string(),
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated user");
        }

        const userId = identity.subject;
        const documents = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });

        return documents;
    }
    
});

export const getTrash  = query ({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error ("Not authenticated user");
        }

        const userId = identity.subject;

        const document = await ctx.db
            // only flectch the document that authorized by user, with userId
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))

            // only fileter the one that we delete
            .filter((q) =>
                q.eq(q.field("isArchived"), true),
            )
            .order("desc")
            .collect();
        return document;
    }
});

export const restore = mutation({
    args: {id: v.id("documents")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error ("Not authenticated user");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument){
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveRestore = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parents", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentDocument", documentId)
                ))
                .collect();

                for (const child of children){
                    await ctx.db.patch(child._id, {
                        isArchived: false,
                    });

                    await recursiveRestore(child._id);
                }
        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };


        // checking to see if the parent Document is archive,
        // if yes, which mean is undefined
        if (existingDocument.parentDocument) {
            const parent = await ctx.db.get(existingDocument.parentDocument);
            if (parent?.isArchived) {
                options.parentDocument = undefined;
            }
        }

        const document = await ctx.db.patch(args.id, options);
        recursiveRestore(args.id);
        return document;
    }
});


export const remove = mutation ({
    args: {id: v.id("documents")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error ("Not authenticated user");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found")
        }

        if (existingDocument.userId !== userId) {
            throw new Error ("Unauthorized");
        }

        const document = await ctx.db.delete(args.id);

        return document;
    }
});

export const getSearch = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error ("Not authenticated user");
        }

        const userId = identity.subject;

        const documensts = await ctx.db 
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.eq(q.field("isArchived"), false),
            )
            .order("desc")
            .collect()

            return documensts;
    }
});