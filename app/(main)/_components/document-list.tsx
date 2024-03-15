// Defines the boundary between server 
// and client code on the module dependency tree
"use-client";

import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

import { Doc, Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api'
import { Item } from './item';
import { FileIcon } from 'lucide-react';


// The DocumentLisprops include:
// parentDocumentId: an identifier for the parent document, which suggest
// that the parent can be nested\
// level: the nesting leve of the documents. It has the default value is 0, 
// at the top of the documents the levvel have a level of 0
interface DocumentListProps {
    parentDocumentId?: Id<"documents">;
    level?: number;
    data?: Doc<"documents">[];
}

// Display a list of documents in a potentially nested structure
export const DocumentList = ({
    parentDocumentId,
    level = 0
}: DocumentListProps) => {
    // useParam access the parameters of the current route
    const params = useParams();

    // useRouter access the router object for navigation, fetching databased
    // on the current route.
    const router = useRouter();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId]
        }));
    };

    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: parentDocumentId
    });

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

    if (documents == undefined) {
        return(
            <>
                <Item.Skeleton level={level} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} />
                        <Item.Skeleton level={level} />
                    </>
                )}
            </>
        );
    };

    return ( 
        <>
            <p
                style={{
                    paddingLeft: level ? `${(level*12) + 25}px` : undefined
                }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    expanded && "last:block",
                    level === 0 && "hidden"
                )}
            >
                No pages inside
            </p>
            
            {documents.map((document) => (
                <div key={document._id}>
                    <Item
                        id={document._id}
                        onClick={() => onRedirect(document._id)}
                        label={document.title}
                        icon={FileIcon}
                        documentIcon={document.icon}
                        active={params.documentId === document._id}
                        level={level}
                        onExpand={() => onExpand(document._id)}
                        expanded={expanded[document._id]}
                    />
                     {/* recursive so we can creat new doc*/}
                    {expanded[document._id] && (
                        <DocumentList
                            parentDocumentId={document._id}
                            level={level+1}
                        />

                    )}
                </div>
            ))}
        </>
    );
}
 
