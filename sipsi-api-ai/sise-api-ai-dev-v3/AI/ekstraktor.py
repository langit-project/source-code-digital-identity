def extract_names(entities):
    names = []
    current_name = []

    for entity in entities:
        if entity['entity'] in {'B-PER', 'I-PER', 'B-ORG', 'I-ORG','B-NOR', 'I-NOR'}: # PER = Person, ORG = Organization, NOR = Political Organization
            word = entity['word']
            if word.startswith('##'):
                current_name[-1] += word[2:]
            else:
                if entity['entity'] == 'B-PER' and current_name:
                    names.append(' '.join(current_name))
                    current_name = []
                current_name.append(word)

    if current_name:
        names.append(' '.join(current_name))

    return names

def extract_organization(entities):
    organizations = []
    current_organization = []

    for entity in entities:
        if entity['entity'] in {'B-ORG', 'I-ORG','B-NOR', 'I-NOR'}:
            word = entity['word']
            if word.startswith('##'):
                current_organization[-1] += word[2:]
            else:
                if entity['entity'] == 'B-NOR' and current_organization:
                    organizations.append(' '.join(current_organization))
                    current_organization = []
                current_organization.append(word)

    if current_organization:
        organizations.append(' '.join(current_organization))

    return organizations