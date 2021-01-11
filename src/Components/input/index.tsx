import React, { useEffect,
                useRef,
                useImperativeHandle,
                forwardRef,
                useState
            } from 'react';
import { TextInputProps } from 'react-native';
import { useField } from '@unform/core';

import { Container,
     TextInput,
      Icon
    } from './styles';
import { useCallback } from 'react';

interface InputProps extends TextInputProps {
    name: string;
    icon: string;
}

interface InputValueReference{
    value:Object
}

interface InputRef{
    focus():void;
}

const Input: React.RefForwardingComponent<InputRef, InputProps> = ({ name, icon, ...rest }, ref) =>{
    const inputElementRef = useRef<any>(null) 

    const { registerField, defaultValue = '', error, fieldName } = useField(name);
    const inputValuetRef = useRef<InputValueReference>({ value: defaultValue });
    
    const [isFocused,setFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(false)


    const handleInputFocus = useCallback(()=>{
        setFocused(true)
    },[]);

    const handleInputBlur = useCallback(()=>{
        setFocused(false);
        setIsFilled(!!inputElementRef.current.value);
    },[])


    useImperativeHandle(ref,()=> ({
        focus(){
            inputElementRef.current.focus();
        }
    }))

    useEffect(()=>{
        registerField({
            name: fieldName,
            ref:inputValuetRef.current,
            path:'value',
            setValue(ref:any, value){
                inputValuetRef.current.value = value;
                inputElementRef.current.setNativeProps({ text: value })
            },
            clearValue(){
                inputValuetRef.current.value = '';
                inputElementRef
            }
        })
    },[fieldName, registerField])

    return (
        <Container isFocused={isFocused} isErrored={!!error}>
            <Icon name={icon} size={20} color={isFocused || isFilled ? '#ff9000' : '#666360'}/>
            <TextInput 
            ref={inputElementRef}
            keyboardAppearance="dark"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholderTextColor="#666360"
            defaultValue={defaultValue}
            onChangeText={(value)=>
                inputValuetRef.current.value = value
            }
            {...rest}
            />
        </Container>
    )
} 


export default forwardRef(Input);