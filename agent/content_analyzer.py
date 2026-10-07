"""
Content Analyzer Module - Markdown content analysis with classification and entity extraction.

This module provides comprehensive parsing and analysis of Markdown documents,
extracting structured information, links, code blocks, tables, and entities.
"""

import re
from typing import Any
from pydantic import BaseModel, Field


class ContentAnalysis(BaseModel):
    """
    Pydantic model representing the complete analysis of a Markdown document.

    Contains extracted sections, links, code blocks, tables, and classification
    information for use in dashboard generation.
    """

    title: str = Field(
        description="The main title of the document (extracted from first H1 or inferred)"
    )

    document_type: str = Field(
        description="Classification of content (tutorial, research, article, guide, notes, etc.)"
    )

    sections: list[str] = Field(
        default_factory=list,
        description="List of section names extracted from headers"
    )

    links: list[str] = Field(
        default_factory=list,
        description="All extracted URLs from the document"
    )

    youtube_links: list[str] = Field(
        default_factory=list,
        description="Extracted YouTube URLs"
    )

    github_links: list[str] = Field(
        default_factory=list,
        description="Extracted GitHub URLs"
    )

    code_blocks: list[dict[str, str]] = Field(
        default_factory=list,
        description="Extracted code blocks with language and content"
    )

    tables: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Extracted table data with headers and rows"
    )

    entities: dict[str, list[str]] = Field(
        default_factory=dict,
        description="Extracted entities (technologies, tools, concepts, etc.)"
    )


# Comprehensive regex patterns for link extraction
# Note: YouTube video IDs are typically 11 characters, but we allow 10-13 for edge cases
YOUTUBE_LINK_REGEX = re.compile(
    r'(?:https?://)?(?:www\.)?'
    r'(?:youtube\.com/(?:watch\?v=|embed/|v/|shorts/|live/)[a-zA-Z0-9_-]{6,13}|'
    r'youtu\.be/[a-zA-Z0-9_-]{6,13})'
    r'(?:[?&][^\s]*)?',
    re.IGNORECASE
)

GITHUB_LINK_REGEX = re.compile(
    r'(?:https?://)?(?:www\.)?(?:'
    r'github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+(?:/[^\s)]*)?|'
    r'raw\.githubusercontent\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+(?:/[^\s)]*)?|'
    r'gist\.github\.com/[a-zA-Z0-9_-]+(?:/[^\s)]*)?|'
    r'github\.io/[^\s)]*'
    r')',
    re.IGNORECASE
)

# Generic URL regex for all links
URL_REGEX = re.compile(
    r'(?:https?://|www\.)[^\s)\]]+',
    re.IGNORECASE
)

# Markdown link pattern [text](url)
MARKDOWN_LINK_REGEX = re.compile(
    r'\[([^\]]+)\]\(([^)]+)\)',
    re.IGNORECASE
)


def parse_markdown(content: str) -> dict[str, Any]:
    """
    Parse Markdown content to extract structural elements.

    Extracts sections (headers), links, code blocks, and tables using
    regex patterns and Markdown syntax rules.

    Args:
        content: Raw Markdown content as string

    Returns:
        Dictionary containing:
        - title: Document title (from first H1 or inferred)
        - sections: List of section names from headers
        - all_links: List of all extracted URLs
        - youtube_links: List of YouTube URLs
        - github_links: List of GitHub URLs
        - code_blocks: List of code block dictionaries
        - tables: List of table dictionaries
    """
    result = {
        'title': '',
        'sections': [],
        'all_links': [],
        'youtube_links': [],
        'github_links': [],
        'code_blocks': [],
        'tables': []
    }

    # Extract title (first H1 header)
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if title_match:
        result['title'] = title_match.group(1).strip()
    else:
        # Fallback: use first line or "Untitled"
        first_line = content.split('\n')[0].strip() if content else ''
        result['title'] = first_line[:100] if first_line else 'Untitled Document'

    # Extract all headers (sections)
    header_pattern = re.compile(r'^(#{1,6})\s+(.+)$', re.MULTILINE)
    headers = header_pattern.findall(content)
    result['sections'] = [header[1].strip() for header in headers]

    # Extract all links (from Markdown syntax [text](url))
    markdown_links = MARKDOWN_LINK_REGEX.findall(content)
    for text, url in markdown_links:
        result['all_links'].append(url.strip())

    # Also extract plain URLs in text
    plain_urls = URL_REGEX.findall(content)
    for url in plain_urls:
        cleaned_url = url.strip()
        if cleaned_url not in result['all_links']:
            result['all_links'].append(cleaned_url)

    # Extract YouTube links
    youtube_matches = YOUTUBE_LINK_REGEX.finditer(content)
    for match in youtube_matches:
        youtube_url = match.group(0)
        if youtube_url not in result['youtube_links']:
            result['youtube_links'].append(youtube_url)

    # Extract GitHub links
    github_matches = GITHUB_LINK_REGEX.finditer(content)
    for match in github_matches:
        github_url = match.group(0)
        if github_url not in result['github_links']:
            result['github_links'].append(github_url)

    # Extract code blocks with language specification
    code_block_pattern = re.compile(r'```(\w*)\n(.*?)```', re.DOTALL)
    code_matches = code_block_pattern.findall(content)
    for language, code in code_matches:
        result['code_blocks'].append({
            'language': language.strip() if language else 'text',
            'code': code.strip()
        })

    # Extract tables (Markdown table syntax)
    # Simple table detection: lines with | separators
    table_pattern = re.compile(
        r'(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]+)*)',
        re.MULTILINE
    )
    table_matches = table_pattern.findall(content)

    for table_text in table_matches:
        lines = [line.strip() for line in table_text.strip().split('\n') if line.strip()]
        if len(lines) >= 2:
            # Parse header row
            header_row = lines[0]
            headers = [cell.strip() for cell in header_row.split('|') if cell.strip()]

            # Parse data rows (skip separator line at index 1)
            rows = []
            for line in lines[2:]:
                cells = [cell.strip() for cell in line.split('|') if cell.strip()]
                if cells:
                    rows.append(cells)

            result['tables'].append({
                'headers': headers,
                'rows': rows,
                'row_count': len(rows)
            })

    return result


def _classify_heuristic(markdown: str, parsed: dict[str, Any]) -> str:
    """
    Heuristic-based document classification fallback.

    Uses keyword patterns and structural analysis to classify documents
    when LLM-based classification is unavailable.

    Args:
        markdown: Raw markdown content
        parsed: Pre-parsed structural data

    Returns:
        Document type classification string
    """
    content_lower = markdown.lower()

    # Check for tutorial indicators
    tutorial_keywords = ['step', 'tutorial', 'how to', 'guide', 'lesson', 'walkthrough']
    if any(keyword in content_lower for keyword in tutorial_keywords):
        return 'tutorial'

    # Check for research indicators
    research_keywords = ['abstract', 'methodology', 'results', 'conclusion', 'references', 'citation']
    if any(keyword in content_lower for keyword in research_keywords):
        return 'research'

    # Check for technical documentation
    tech_doc_keywords = ['api', 'endpoint', 'parameter', 'function', 'class', 'method']
    if any(keyword in content_lower for keyword in tech_doc_keywords) and len(parsed['code_blocks']) >= 2:
        return 'technical_doc'

    # Check for code-heavy content (guides)
    if len(parsed['code_blocks']) >= 3:
        return 'guide'

    # Check for notes (short, list-heavy)
    if len(markdown) < 1000 and content_lower.count('\n- ') > 5:
        return 'notes'

    # Default to article
    return 'article'
