import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import exp from "constants";

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
    
})